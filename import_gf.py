"""把 GF.xlsx（銀行內部法規遵循手冊）轉成 data/gf_manual.json。

用法：  python import_gf.py [GF.xlsx 路徑]      （預設讀 data/GF.xlsx）
產生的 JSON 會在 app 啟動時被 db.init_db() 匯入 manual 資料表與 RAG 知識庫。
01_全法規綜合速查表 和 02~07 各專章有重複的條文，這裡依「法規＋條號＋主題」去重，保留專章的編號（BK-01 這類）。
"""
import json
import os
import sys

import openpyxl

BASE = os.path.dirname(os.path.abspath(__file__))
FIELDS = ["id", "cat", "law", "title", "summary", "scene", "sop", "checklist", "violation", "effect", "owner", "risk"]


def clean(v):
    return "" if v is None else str(v).replace("\r", "").strip()


def main(path):
    wb = openpyxl.load_workbook(path, data_only=True)
    entries, seen = [], {}
    for ws in wb.worksheets[1:]:
        header = False
        for r in ws.iter_rows(values_only=True):
            if r and r[0] == "項次":
                header = True
                continue
            if not header or not r or not r[0]:
                continue
            row = dict(zip(FIELDS, [clean(x) for x in r[:12]]))
            key = (row["cat"], row["law"], row["title"])
            if key in seen:
                prev = entries[seen[key]]
                if prev["id"].startswith("ALL-") and not row["id"].startswith("ALL-"):
                    entries[seen[key]] = row  # 改用專章編號
                continue
            seen[key] = len(entries)
            entries.append(row)
    # 工作表 00 的總覽（六大法規定位、風險等級定義）
    overview = []
    for r in wb.worksheets[0].iter_rows(values_only=True):
        a, b = clean(r[0]), clean(r[1])
        if a and b and a != b and a[0] in "123456【" and len(b) > 20:
            overview.append({"title": a.strip("【】 "), "text": b})
    out = {"entries": entries, "overview": overview}
    dest = os.path.join(BASE, "data", "gf_manual.json")
    json.dump(out, open(dest, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"匯出 {len(entries)} 條法規、{len(overview)} 則總覽 → {dest}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(BASE, "data", "GF.xlsx"))
