# 幸福銀行 金融任務（Flask + SQLite + RAG）

## 專案結構
```
bank-quest-app/
├─ app.py              Flask 後端：遊戲 API、玩家 API、後台
├─ db.py               SQLite 存取、建表、匯入資料、語意檢索、玩家與後台查詢
├─ embed.py            文字向量化（MiniLM；沒安裝時自動改用雜湊向量備援）
├─ schema.sql          資料表：chunks / manual / game_qa / learn / players / events / questions
├─ import_gf.py        把 data/GF.xlsx 轉成 data/gf_manual.json
├─ data/
│  ├─ seed.json        內建知識片段、櫃台預設問題、「學到的重點」
│  ├─ GF.xlsx          銀行法規遵循手冊（六大法規）
│  └─ gf_manual.json   由 GF.xlsx 轉出，啟動時匯入資料庫
├─ templates/          index.html（遊戲）、admin.html、admin_login.html
└─ static/             css/game.css、js/game.js、css/admin.css、js/admin.js
```

## 執行（Windows）
```
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
set ADMIN_PASSWORD=換成你自己的密碼
python app.py
```
- 遊戲：http://127.0.0.1:5000
- 後台：http://127.0.0.1:5000/admin
- 沒設定 ADMIN_PASSWORD 時，啟動時終端機會印出臨時密碼（每次啟動不同）。
- 第一次啟動會自動建立 `bankquest.db`，並為知識庫建立向量。

### 改用真正的語意模型（建議）
```
pip install sentence-transformers
python app.py
```
會改用 paraphrase-multilingual-MiniLM-L12-v2（第一次要下載模型），換模型後啟動時會自動重算向量，
檢索分數門檻也會自動換成適合該模型的數值（可用環境變數 BANKQUEST_SCORE_MIN 覆蓋）。
不安裝時用的是字元二元組雜湊向量，只能比對字面相近的詞，法律用語的問法一多就會排錯，建議正式使用前一定要換成語意模型。

### 選用：讓 Gemini 把檢索結果改寫成口語回答
設定 `GEMINI_API_KEY` 後啟用；只會根據檢索到的片段回答，沒設定就直接顯示檢索到的原文。

## GF.xlsx 怎麼用在遊戲裡
1. **RAG 知識庫**：64 條法規 + 6 則總覽，每條一個片段（含規範摘要、檢核重點、常見違規、法律效果）。玩家在櫃台選「自由提問」時一併檢索，答案會標示出處，GF 的條目可展開看完整條文。
2. **法規手冊**：櫃台選「📖 翻閱法規手冊」，可依法規分類篩選、關鍵字搜尋，逐條展開。
3. 更新手冊：換掉 `data/GF.xlsx` → `python import_gf.py` → 重新啟動即可（只有內容有變的片段會重算向量）。

## 玩家名稱與資料
- 首頁輸入名稱（1～12 字）才能開始；遊戲裡所有「小安」會換成玩家的名稱。
- 玩家的編號與憑證存在瀏覽器 localStorage，同一台瀏覽器再次遊玩會沿用同一筆玩家資料（次數累計、名稱可修改）。清除瀏覽器資料或換裝置會變成新玩家。
- 每完成一個任務、通關時，進度會回報到 `players` 表；後端連不上時遊戲照常進行，只是不會記錄。

## 後台功能
- 統計：玩家人數、開始遊戲次數、通關人數、通關者平均答錯次數、5 個任務各有多少人完成。
- 玩家：搜尋、排序，改名、加備註、重設進度、刪除，匯出 CSV（Excel 可直接開）。
- 櫃台自由提問：看玩家問了什麼，篩出「知識庫答不出來」的問題，作為補資料的依據。
- 安全：密碼比對、登入失敗延遲 1 秒、後台寫入動作需帶 CSRF 憑證、CSV 對公式開頭字元做跳脫、所有顯示一律轉義。

## 常用 SQL
```sql
SELECT name, plays, finished, rank, mistakes FROM players ORDER BY last_seen DESC;
SELECT question FROM questions WHERE answered = 0;      -- 該補進知識庫的問題
SELECT kind, COUNT(*) FROM events GROUP BY kind;
```

## 注意
- 這是教學／展示用的開發伺服器設定。要公開上線，請改用 gunicorn 等正式伺服器、設定 SECRET_KEY 與 ADMIN_PASSWORD、走 HTTPS，並考慮對 /api/player 與 /api/ask 加上頻率限制。
- 玩家名稱與提問內容屬於使用者輸入，請勿在名稱欄輸入真實個資；上線前建議在首頁加上蒐集說明。
- 法規內容（條文、存保 300 萬、民法 16%、刑責等）是教育用整理，GF.xlsx 為內部手冊性質，上線前請對照全國法規資料庫與最新公告。遊戲角色與公司皆為虛構。


## 白話內容怎麼改（data/plain.json）

櫃台回答、法規手冊顯示的「白話說」都來自 `data/plain.json`，每一條是三段：

```json
"CV-04": ["白話說明", "生活例子", "您可以這樣做"]
```

- key 是 GF 手冊編號（BK-01、CV-04…）或核心條文 id（law-29、calc-360…）；`ov0`～`ov5` 是六大法規總覽。
- `_tags` 放日常用語同義詞（例如「掉了、弄丟」對應「喪失」），讓一般人的說法也找得到條文。
- 改完重新啟動 `python app.py` 就會自動更新資料庫並重算向量。
- 法條原文仍保留在資料庫與「看完整條文」裡，白話只是第一層說明。

> 白話版是為了教育用途整理，數字與條文請以最新法規為準；正式公開前建議請法律或金融專業人士審閱一遍。


## 前情提要與闖關地圖

開始冒險後的流程：**輸入名稱 → 前情提要（3 頁，可略過）→ 闖關地圖 → 選關出發**。

- 地圖上有 5 關（對應 5 個任務），依進度顯示 ✓ 已通關、發光的「目前關卡」、🔒 尚未解鎖；點關卡看說明與提示，按「出發」會直接傳送到該關的位置。
- 遊戲中隨時可按左上角「地圖」或鍵盤 `G` 重開地圖，已通關的關卡可以「再訪此關」。
- 想改劇情文字或關卡名稱／座標：在 `static/js/game.js` 找 `STORY`（劇情）與 `STG`（關卡，`px/py` 是地圖上的百分比位置，`x/y` 是傳送後的遊戲座標）。

## 第 2～5 章（chapters.json）

- 內容放在 `data/chapters.json`，由 `/api/chapters` 提供給前端；共 4 章 × 5 關 = 20 關，加上第 1 章合計 25 關。
- 結構：`cast`（角色外觀）＋ `chapters[]`（id、scene、title、short、law、fraud、place、`missions[]`）。
- 每關欄位：`id, name, npc, obj?, x, y, stand:[x,y,dir], label, desc, hint, intro, quiz[{q,opts:[[文字,答錯回饋]],ok}], outro, learn, again`。`[[...]]` 會標紅。選項順序遊玩時自動洗牌。
- 新增關卡：在 `missions` 加一筆；`db.MISSIONS` 會自動收錄，後台漏斗跟著更新。新增章節除了 JSON，還要在 `game.js` 加場景圖與 `SCN` 的碰撞範圍。
- 第 2～5 章需要後端（python app.py）；單檔離線版只有第 1 章。
- 條文與數字為教育用整理，上線前請法律／金融專業人士審閱。

## 分數與排名
- 滿分 1000，答錯一次扣 20 分（最低 0）。公式在 `db.score_of()` 與 `game.js` 的 `scoreOf()`，要改計分兩處一起改。
- 通關後先看學習總整理，按「結束遊戲，看排名」進入結束畫面，顯示前 10 名與自己的名次。同分先通關者在前。
- 分數由伺服器依答錯次數計算，取每位玩家的最高分；API：`GET /api/leaderboard?id=&token=`。
