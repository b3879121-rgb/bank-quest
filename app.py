"""幸福銀行 金融任務：Flask 後端。

執行：  python app.py      遊戲 http://127.0.0.1:5000    後台 http://127.0.0.1:5000/admin
後台密碼：環境變數 ADMIN_PASSWORD；沒設定時，每次啟動會產生臨時密碼並印在終端機。
"""
import csv
import functools
import io
import json
import os
import secrets
import time
import urllib.request

from flask import Flask, Response, abort, jsonify, redirect, render_template, request, session

import db
import embed

app = Flask(__name__)
app.config.update(SESSION_COOKIE_HTTPONLY=True, SESSION_COOKIE_SAMESITE="Lax")
app.secret_key = os.environ.get("SECRET_KEY") or secrets.token_hex(32)

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")
if not ADMIN_PASSWORD:
    ADMIN_PASSWORD = secrets.token_urlsafe(9)
    print(f"[admin] 未設定 ADMIN_PASSWORD，本次啟動的臨時後台密碼：{ADMIN_PASSWORD}")

db.init_db()

NOT_FOUND = (
    "這個問題我們的知識庫查不到確定的答案。建議撥打 165 反詐騙專線，或向金管會、律師等專業管道查證。\n\n"
    "目前知識庫涵蓋：銀行法、民法、公司法、票據法、金融消費者保護法、個人資料保護法，以及防詐騙常識。"
)


def llm_answer(question, hits):
    """選用：設定 GEMINI_API_KEY 後，讓 Gemini 只根據檢索到的片段寫成口語回答。失敗就回傳 None。"""
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        return None
    # 用「-latest」別名，舊型號退役時不用改程式；lite 版回應快（約 1 秒），不會超過 15 秒逾時
    model = os.environ.get("GEMINI_MODEL", "gemini-flash-lite-latest")
    ctx = "\n".join(f"[{h['ref']}] {h['summary']}" for h in hits)
    prompt = (
        "你是銀行櫃台的林小姐，用親切口語的繁體中文，只根據下面的資料回答，120 字以內。"
        "資料沒有提到的內容就說不確定，並建議撥 165 或洽專業人士，不要自己編造。\n\n"
        f"資料：\n{ctx}\n\n客人的問題：{question}"
    )
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    req = urllib.request.Request(
        url,
        data=json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode(),
        headers={"Content-Type": "application/json", "x-goog-api-key": key},
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.load(r)["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as e:
        print("[llm] 呼叫失敗，改用檢索結果：", type(e).__name__)
        return None


# ================= 遊戲 =================
@app.get("/")
def index():
    return render_template("index.html")


@app.get("/api/content")
def api_content():
    return jsonify(db.content())


@app.get("/api/chapters")
def api_chapters():
    return jsonify(db.chapters_data())


@app.get("/api/manual")
def api_manual():
    return jsonify(db.manual())


@app.post("/api/player")
def api_player():
    d = request.get_json(silent=True) or {}
    name = db.clean_name(d.get("name"))
    if not name:
        return jsonify(error="名稱需要 1～12 個字"), 400
    return jsonify(db.start_player(name, d.get("id"), d.get("token")))


@app.post("/api/progress")
def api_progress():
    d = request.get_json(silent=True) or {}
    p = db.get_player(d.get("id"), d.get("token"))
    if not p:
        return jsonify(error="玩家憑證無效"), 403
    db.save_progress(p, d.get("done"), d.get("mistakes"), bool(d.get("finished")), d.get("rank"))
    return jsonify(ok=True)


@app.post("/api/ask")
def api_ask():
    d = request.get_json(silent=True) or {}
    q = (d.get("q") or "").strip()[:200]
    if len(q) < 2:
        return jsonify(error="請輸入至少 2 個字的問題"), 400
    p = db.get_player(d.get("id"), d.get("token"))
    hits = db.search(q, k=3)
    answered = db.log_question(q, hits, p["id"] if p else None)
    if not answered:
        return jsonify(answered=False, answer=NOT_FOUND, sources=[])
    good = [h for h in hits if db.is_relevant(h)]
    answer = llm_answer(q, good) or good[0]["summary"]
    return jsonify(answered=True, answer=answer, sources=good)


@app.get("/api/leaderboard")
def api_leaderboard():
    return jsonify(db.leaderboard(request.args.get("id"), request.args.get("token")))


@app.get("/api/health")
def health():
    with db.conn() as c:
        n = c.execute("SELECT COUNT(*) FROM chunks").fetchone()[0]
        gf = c.execute("SELECT COUNT(*) FROM manual").fetchone()[0]
    return jsonify(ok=True, embed_model=embed.model_name(), chunks=n, manual_entries=gf, llm=bool(os.environ.get("GEMINI_API_KEY")))


# ================= 後台 =================
def admin_only(f):
    @functools.wraps(f)
    def wrap(*a, **k):
        if not session.get("admin"):
            return jsonify(error="未登入"), 401
        if request.method != "GET" and not secrets.compare_digest(request.headers.get("X-CSRF-Token", ""), session.get("csrf", "")):
            abort(403)
        return f(*a, **k)

    return wrap


@app.get("/admin")
def admin_page():
    if not session.get("admin"):
        return render_template("admin_login.html", error=request.args.get("e"))
    session.setdefault("csrf", secrets.token_hex(16))
    return render_template("admin.html", csrf=session["csrf"])


@app.post("/admin/login")
def admin_login():
    if secrets.compare_digest(request.form.get("password", ""), ADMIN_PASSWORD):
        session.clear()
        session["admin"] = True
        session["csrf"] = secrets.token_hex(16)
        return redirect("/admin")
    time.sleep(1)  # 減緩暴力猜密碼
    return redirect("/admin?e=1")


@app.post("/admin/logout")
def admin_logout():
    session.clear()
    return redirect("/admin")


@app.get("/admin/api/stats")
@admin_only
def admin_stats():
    return jsonify(db.admin_stats())


@app.get("/admin/api/players")
@admin_only
def admin_players():
    return jsonify(db.admin_players(request.args.get("q", "").strip(), request.args.get("sort", "last_seen")))


@app.post("/admin/api/player/<int:pid>")
@admin_only
def admin_player_update(pid):
    d = request.get_json(silent=True) or {}
    name = db.clean_name(d["name"]) if "name" in d else None
    if "name" in d and not name:
        return jsonify(error="名稱需要 1～12 個字"), 400
    note = str(d["note"]) if "note" in d else None
    return jsonify(ok=db.admin_update_player(pid, name, note))


@app.post("/admin/api/player/<int:pid>/reset")
@admin_only
def admin_player_reset(pid):
    db.admin_reset_player(pid)
    return jsonify(ok=True)


@app.delete("/admin/api/player/<int:pid>")
@admin_only
def admin_player_delete(pid):
    db.admin_delete_player(pid)
    return jsonify(ok=True)


@app.get("/admin/api/questions")
@admin_only
def admin_questions():
    return jsonify(db.admin_questions(request.args.get("unanswered") == "1"))


@app.get("/admin/players.csv")
@admin_only
def admin_csv():
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["編號", "名稱", "建立時間", "最後上線", "遊玩次數", "已完成任務", "答錯次數", "是否通關", "稱號", "通關時間", "備註"])

    def safe(v):  # 避免用 Excel 開啟時，以 = + - @ 開頭的內容被當成公式
        s = "" if v is None else str(v)
        return "'" + s if s and s[0] in "=+-@" else s

    for p in db.admin_players():
        w.writerow([p["id"], safe(p["name"]), p["created_at"], p["last_seen"], p["plays"], len(p["done"]), p["mistakes"], "是" if p["finished"] else "否", safe(p["rank"]), p["finished_at"] or "", safe(p["note"])])
    return Response("﻿" + buf.getvalue(), mimetype="text/csv", headers={"Content-Disposition": "attachment; filename=players.csv"})


if __name__ == "__main__":
    app.run(debug=os.environ.get("FLASK_DEBUG") == "1")
