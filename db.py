"""SQLite 存取、RAG 檢索、玩家與後台查詢。"""
import json
import os
import re
import secrets
import sqlite3
import unicodedata

import numpy as np

import embed

BASE = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get("BANKQUEST_DB", os.path.join(BASE, "bankquest.db"))
CH1_MISSIONS = ["ming", "ticket", "consult", "record", "verify"]
CHAPTERS_PATH = os.path.join(BASE, "data", "chapters.json")


def chapters_data():
    """第 2～5 章的關卡內容（人物、對白、題目）。檔案不存在就當作只有第 1 章。"""
    try:
        with open(CHAPTERS_PATH, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return {"cast": {}, "chapters": []}


MISSIONS = CH1_MISSIONS + [m["id"] for ch in chapters_data()["chapters"] for m in ch["missions"]]


def score_min():
    """低於這個分數視為「知識庫查不到」。真正的語意模型分數較高，備援雜湊向量分數普遍偏低，所以門檻不同。"""
    if os.environ.get("BANKQUEST_SCORE_MIN"):
        return float(os.environ["BANKQUEST_SCORE_MIN"])
    return 0.16 if embed.model_name().startswith("hash") else 0.40


EMBED_SCHEME = "v4"  # 改變「拿什麼文字去做向量」時改這個，啟動時會自動重算


def emb_tag():
    return f"{embed.model_name()}|{EMBED_SCHEME}"


def score_strong():
    """語意分數高到不需要字面重疊也算相關（例如問「吸金」、條文寫「收受存款」）。雜湊備援沒有語意能力，所以停用。"""
    if os.environ.get("BANKQUEST_SCORE_STRONG"):
        return float(os.environ["BANKQUEST_SCORE_STRONG"])
    return 9.9 if embed.model_name().startswith("hash") else 0.68


COV_MIN = 0.30  # 問題裡的關鍵詞，至少要有這個比例出現在條文裡
_GENERIC = sorted(["多少", "什麼", "怎麼", "如何", "可以", "是否", "哪些", "為什麼", "為何", "請問", "告訴", "需要", "應該", "有沒有", "一下", "哪裡", "怎樣", "是不是", "能不能", "可不可以", "會不會", "多久", "幾"], key=len, reverse=True)
_SPLIT = re.compile(r"[\s，。、；：！？「」『』（）()\[\]【】,.!?;:\"'—\-" + re.escape(embed.STOP_CHARS) + "]+")


def _bigrams(s):
    """把文字依標點與虛字切成片段，只在片段內取連續兩字，避免跨過虛字湊出不存在的詞。"""
    out = set()
    s = re.sub(r"\s+", "", s.lower().translate(embed._NUM))  # 「月領 3 萬」和「月領3萬」視為相同
    for seg in _SPLIT.split(s):
        out.update(seg[i : i + 2] for i in range(len(seg) - 1))
    return out


def _query_terms(q):
    for g in _GENERIC:
        q = q.replace(g, " ")
    return _bigrams(q)


def conn():
    c = sqlite3.connect(DB_PATH)
    c.row_factory = sqlite3.Row
    return c


def _upsert_chunk(c, id, title, ref, text, summary, source, tags):
    c.execute(
        "INSERT INTO chunks(id,title,ref,text,summary,source,tags) VALUES(?,?,?,?,?,?,?) "
        "ON CONFLICT(id) DO UPDATE SET title=excluded.title, ref=excluded.ref, summary=excluded.summary, "
        "source=excluded.source, tags=excluded.tags, text=excluded.text, "
        "emb_model=CASE WHEN chunks.text=excluded.text AND chunks.tags=excluded.tags AND chunks.summary IS excluded.summary THEN chunks.emb_model END, "
        "embedding=CASE WHEN chunks.text=excluded.text AND chunks.tags=excluded.tags AND chunks.summary IS excluded.summary THEN chunks.embedding END",
        (id, title, ref, text, summary, source, tags),
    )


def compose(pl):
    """白話三件組 → 櫃台口語回答：先講重點，再舉例，最後說可以怎麼做。"""
    plain, eg, todo = pl
    out = plain
    if eg:
        out += "\n\n舉個例子：" + eg
    if todo:
        out += "\n\n您可以這樣做：" + todo
    return out.replace("你", "您")  # 櫃台林小姐對客人用「您」


def init_db():
    """建表、匯入種子資料與 GF 手冊、補算或重算向量。可重複執行。"""
    with conn() as c:
        c.executescript(open(os.path.join(BASE, "schema.sql"), encoding="utf-8").read())
        # 舊版資料庫沒有的欄位
        cols = {r["name"] for r in c.execute("PRAGMA table_info(chunks)")}
        for col, ddl in (("summary", "TEXT"), ("source", "TEXT NOT NULL DEFAULT 'core'")):
            if col not in cols:
                c.execute(f"ALTER TABLE chunks ADD COLUMN {col} {ddl}")
        mcols = {r["name"] for r in c.execute("PRAGMA table_info(manual)")}
        for col in ("plain", "eg", "todo"):
            if col not in mcols:
                c.execute(f"ALTER TABLE manual ADD COLUMN {col} TEXT")
        pcols = {r["name"] for r in c.execute("PRAGMA table_info(players)")}
        for col, ddl in (("best_score", "INTEGER"), ("best_at", "TEXT")):
            if col not in pcols:
                c.execute(f"ALTER TABLE players ADD COLUMN {col} {ddl}")
        qcols = {r["name"] for r in c.execute("PRAGMA table_info(questions)")}
        if "player_id" not in qcols:
            c.execute("ALTER TABLE questions ADD COLUMN player_id INTEGER")

        seed = json.load(open(os.path.join(BASE, "data", "seed.json"), encoding="utf-8"))
        pf = os.path.join(BASE, "data", "plain.json")
        PLAIN = json.load(open(pf, encoding="utf-8")) if os.path.exists(pf) else {}
        TAGS = PLAIN.get("_tags", {})
        for ch in seed["chunks"]:
            pl = PLAIN.get(ch["id"])
            _upsert_chunk(c, ch["id"], ch["title"], ch["ref"], ch["text"], compose(pl) if pl else ch["text"], "core", ch["tags"])
        for q in seed["qa"]:
            c.execute(
                "INSERT OR REPLACE INTO game_qa(id,ord,q,type,rec,lines,learn) VALUES(?,?,?,?,?,?,?)",
                (q["id"], q["ord"], q["q"], q["type"], q["rec"], json.dumps(q["lines"], ensure_ascii=False), q["learn"]),
            )
        for k, t in seed["learn"].items():
            c.execute("INSERT OR REPLACE INTO learn(key,text) VALUES(?,?)", (k, t))

        gf = os.path.join(BASE, "data", "gf_manual.json")
        if os.path.exists(gf):
            d = json.load(open(gf, encoding="utf-8"))
            for e in d["entries"]:
                pl = PLAIN.get(e["id"]) or ["", "", ""]
                e = dict(e, plain=pl[0], eg=pl[1], todo=pl[2])
                c.execute(
                    "INSERT OR REPLACE INTO manual(id,cat,law,title,summary,scene,sop,checklist,violation,effect,owner,risk,plain,eg,todo) "
                    "VALUES(:id,:cat,:law,:title,:summary,:scene,:sop,:checklist,:violation,:effect,:owner,:risk,:plain,:eg,:todo)", e
                )
                detail = (
                    (f"白話說明：{pl[0]}\n生活例子：{pl[1]}\n您可以這樣做：{pl[2]}\n\n" if pl[0] else "")
                    + f"【{e['cat']} {e['law']}】{e['title']}\n條文重點（原文）：{e['summary']}\n適用環節：{e['scene']}\n"
                    f"檢核重點：{e['checklist']}\n常見違規：{e['violation']}\n法律效果：{e['effect']}\n風險等級：{e['risk']}"
                )
                short = compose(pl) if pl[0] else e["summary"] + ("\n法律效果：" + e["effect"] if e["effect"] else "")
                _upsert_chunk(c, "gf-" + e["id"], e["title"], f"{e['cat']} {e['law']}（GF手冊）", detail, short, "GF",
                              f"{e['cat']} {e['law']} {e['scene']} {e['risk']} {e['violation']} {TAGS.get(e['id'], '')}")
            c.execute("DELETE FROM chunks WHERE id IN ('gf-ov-6','gf-ov-7','gf-ov-8','gf-ov-9','gf-ov-10','gf-ov-11')")
            for i, o in enumerate(d.get("overview", [])[:6]):  # 後 6 筆是給行員看的檢核說明，不放進問答知識庫
                _upsert_chunk(c, f"gf-ov-{i}", o["title"], "GF 手冊總覽", o["text"], PLAIN.get(f"ov{i}", [o["text"]])[0], "GF", o["title"])

        name = emb_tag()
        rows = c.execute("SELECT id,title,text,summary,tags FROM chunks WHERE emb_model IS NOT ? OR embedding IS NULL", (name,)).fetchall()
        if rows:
            vecs = embed.embed([f"{r['title']}。{r['summary'] or r['text']} {r['tags']}" for r in rows])
            for r, v in zip(rows, vecs):
                c.execute("UPDATE chunks SET emb_model=?, embedding=? WHERE id=?", (name, v.tobytes(), r["id"]))
            print(f"[db] 已為 {len(rows)} 筆片段建立向量（{name}）")


# ---------- 遊戲內容 ----------
def content():
    with conn() as c:
        qa = [
            {"id": r["id"], "q": r["q"], "type": r["type"], "rec": r["rec"], "a": json.loads(r["lines"]), "learn": r["learn"]}
            for r in c.execute("SELECT * FROM game_qa ORDER BY ord")
        ]
        learn = {r["key"]: r["text"] for r in c.execute("SELECT key,text FROM learn")}
    return {"qa": qa, "learn": learn}


def manual():
    with conn() as c:
        return [dict(r) for r in c.execute("SELECT * FROM manual ORDER BY cat, id")]


# ---------- RAG ----------
def search(question, k=3):
    """語意檢索：問題轉向量，和所有片段做餘弦相似度，回傳分數最高的 k 筆。"""
    with conn() as c:
        rows = c.execute("SELECT id,title,ref,text,summary,source,tags,embedding FROM chunks WHERE emb_model=?", (emb_tag(),)).fetchall()
    if not rows:
        return []
    mat = np.vstack([np.frombuffer(r["embedding"], dtype=np.float32) for r in rows])
    sem = mat @ embed.embed([question])[0]
    terms = _query_terms(question)
    cov = np.zeros(len(rows))
    if terms:
        for i, r in enumerate(rows):
            have = _bigrams(f"{r['title']} {r['ref']} {r['text']} {r['tags']}")
            cov[i] = len(terms & have) / len(terms)
    final = sem + 0.35 * cov  # 語意為主，字面重疊加分，讓用詞吻合的條文排前面
    return [
        {"id": rows[i]["id"], "title": rows[i]["title"], "ref": rows[i]["ref"], "source": rows[i]["source"],
         "summary": rows[i]["summary"] or rows[i]["text"], "text": rows[i]["text"],
         "score": round(float(sem[i]), 3), "cov": round(float(cov[i]), 2)}
        for i in np.argsort(-final)[:k]
    ]


def is_relevant(h):
    """一筆結果要同時過兩關才算相關：語意夠近，而且問題的關鍵詞真的出現在條文裡。
    語意分數特別高時可以免除字面條件。"""
    if not h:
        return False
    if h["cov"] >= 0.8 and h["score"] >= score_min() * 0.6:  # 問題的關鍵詞幾乎全在條文裡（例如「支票掉了」對上掛失止付），語意分數可放寬一點
        return True
    return (h["score"] >= score_min() and h["cov"] >= COV_MIN) or h["score"] >= score_strong()


def log_question(question, hits, player_id=None):
    top = hits[0] if hits else None
    ok = int(is_relevant(top))
    with conn() as c:
        c.execute(
            "INSERT INTO questions(question,player_id,top_chunk,top_score,answered) VALUES(?,?,?,?,?)",
            (question, player_id, top["id"] if top else None, top["score"] if top else None, ok),
        )
        if player_id:
            c.execute("INSERT INTO events(player_id,kind,detail) VALUES(?,?,?)", (player_id, "ask", question[:80]))
    return bool(ok)


# ---------- 玩家 ----------
def clean_name(raw):
    s = "".join(ch for ch in str(raw or "") if unicodedata.category(ch) not in ("Cc", "Cf", "Cs", "Co", "Cn"))
    s = " ".join(s.split())
    return s if 1 <= len(s) <= 12 else None


def get_player(pid, token):
    try:
        pid = int(pid)
    except (TypeError, ValueError):
        return None
    with conn() as c:
        r = c.execute("SELECT * FROM players WHERE id=?", (pid,)).fetchone()
    if r and token and secrets.compare_digest(str(r["token"]), str(token)):
        return r
    return None


def start_player(name, pid=None, token=None):
    """玩家按下「開始冒險」：已有紀錄就更新名稱並累計次數，沒有就建立新玩家。"""
    with conn() as c:
        p = get_player(pid, token)
        if p:
            c.execute("UPDATE players SET name=?, plays=plays+1, last_seen=datetime('now'), done_json='[]', mistakes=0 WHERE id=?", (name, p["id"]))
            pid, token = p["id"], p["token"]
        else:
            token = secrets.token_urlsafe(16)
            cur = c.execute("INSERT INTO players(name,token,plays) VALUES(?,?,1)", (name, token))
            pid = cur.lastrowid
        c.execute("INSERT INTO events(player_id,kind,detail) VALUES(?,?,?)", (pid, "start", name))
    return {"id": pid, "token": token, "name": name}


def save_progress(p, done, mistakes, finished=False, rank=None):
    done = [m for m in MISSIONS if m in (done or [])]
    mistakes = max(0, min(int(mistakes or 0), 999))
    with conn() as c:
        old = set(json.loads(p["done_json"]))
        c.execute("UPDATE players SET done_json=?, mistakes=?, last_seen=datetime('now') WHERE id=?", (json.dumps(done), mistakes, p["id"]))
        for m in done:
            if m not in old:
                c.execute("INSERT INTO events(player_id,kind,detail) VALUES(?,?,?)", (p["id"], "mission", m))
        if finished and len(done) == len(MISSIONS):
            c.execute("UPDATE players SET finished=1, rank=?, finished_at=datetime('now') WHERE id=?", ((rank or "")[:20], p["id"]))
            c.execute("INSERT INTO events(player_id,kind,detail) VALUES(?,?,?)", (p["id"], "finish", f"{rank} / 答錯 {mistakes}"))
            sc = score_of(mistakes)
            if p["best_score"] is None or sc > p["best_score"]:
                c.execute("UPDATE players SET best_score=?, best_at=datetime('now') WHERE id=?", (sc, p["id"]))


def score_of(mistakes):
    """滿分 1000，答錯一次扣 20 分，最低 0 分。"""
    return max(0, 1000 - 20 * int(mistakes or 0))


def leaderboard(pid=None, token=None, top=10):
    """通關玩家排行榜：分數高者在前，同分則先通關者在前。"""
    with conn() as c:
        rows = c.execute("SELECT id,name,best_score,best_at FROM players WHERE best_score IS NOT NULL ORDER BY best_score DESC, best_at ASC, id ASC").fetchall()
    me = get_player(pid, token) if pid else None
    out, mine = [], None
    for i, r in enumerate(rows, 1):
        if me and r["id"] == me["id"]:
            mine = {"rank": i, "name": r["name"], "score": r["best_score"]}
        if i <= top:
            out.append({"rank": i, "name": r["name"], "score": r["best_score"], "me": bool(me and r["id"] == me["id"])})
    return {"top": out, "total": len(rows), "me": mine}


# ---------- 後台 ----------
def admin_players(q="", sort="last_seen"):
    order = {"last_seen": "last_seen DESC", "created": "created_at DESC", "name": "name COLLATE NOCASE ASC", "plays": "plays DESC", "mistakes": "mistakes DESC"}.get(sort, "last_seen DESC")
    with conn() as c:
        rows = c.execute(f"SELECT id,name,created_at,last_seen,plays,done_json,mistakes,finished,rank,finished_at,note FROM players WHERE name LIKE ? OR note LIKE ? ORDER BY {order}", (f"%{q}%", f"%{q}%")).fetchall()
    out = []
    for r in rows:
        d = dict(r)
        d["done"] = json.loads(d.pop("done_json"))
        out.append(d)
    return out


def admin_stats():
    with conn() as c:
        ps = c.execute("SELECT done_json, mistakes, finished FROM players").fetchall()
        qs = c.execute("SELECT COUNT(*), COALESCE(SUM(answered),0) FROM questions").fetchone()
        top = c.execute("SELECT question, COUNT(*) n FROM questions GROUP BY question ORDER BY n DESC, MAX(id) DESC LIMIT 8").fetchall()
        plays = c.execute("SELECT COALESCE(SUM(plays),0) FROM players").fetchone()[0]
    funnel = {m: 0 for m in MISSIONS}
    for p in ps:
        for m in json.loads(p["done_json"]):
            if m in funnel:
                funnel[m] += 1
    fin = [p for p in ps if p["finished"]]
    return {
        "players": len(ps), "plays": plays, "finished": len(fin), "funnel": funnel,
        "avg_mistakes_finished": round(sum(p["mistakes"] for p in fin) / len(fin), 1) if fin else None,
        "questions": qs[0], "questions_answered": qs[1], "top_questions": [dict(r) for r in top],
    }


def admin_questions(only_unanswered=False, limit=200):
    sql = ("SELECT q.id, q.asked_at, q.question, q.top_chunk, q.top_score, q.answered, p.name AS player "
           "FROM questions q LEFT JOIN players p ON p.id=q.player_id ")
    if only_unanswered:
        sql += "WHERE q.answered=0 "
    with conn() as c:
        return [dict(r) for r in c.execute(sql + "ORDER BY q.id DESC LIMIT ?", (limit,))]


def admin_update_player(pid, name=None, note=None):
    with conn() as c:
        if name is not None:
            c.execute("UPDATE players SET name=? WHERE id=?", (name, pid))
        if note is not None:
            c.execute("UPDATE players SET note=? WHERE id=?", (note[:200], pid))
        return c.total_changes > 0


def admin_reset_player(pid):
    with conn() as c:
        c.execute("UPDATE players SET done_json='[]', mistakes=0, finished=0, rank=NULL, finished_at=NULL, plays=0 WHERE id=?", (pid,))
        c.execute("INSERT INTO events(player_id,kind,detail) VALUES(?,?,?)", (pid, "admin", "reset"))


def admin_delete_player(pid):
    with conn() as c:
        c.execute("DELETE FROM players WHERE id=?", (pid,))
        c.execute("DELETE FROM events WHERE player_id=?", (pid,))
        c.execute("UPDATE questions SET player_id=NULL WHERE player_id=?", (pid,))
