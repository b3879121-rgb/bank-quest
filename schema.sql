-- 幸福銀行 金融任務：SQLite 資料表

-- RAG 知識庫：每筆是一個可被檢索的片段（chunk），向量以 float32 BLOB 存放
CREATE TABLE IF NOT EXISTS chunks (
  id        TEXT PRIMARY KEY,
  title     TEXT NOT NULL,
  ref       TEXT NOT NULL,          -- 出處，例如「銀行法 §29」
  text      TEXT NOT NULL,          -- 完整內容
  summary   TEXT,                   -- 給玩家看的簡短回答（沒有就用 text）
  source    TEXT NOT NULL DEFAULT 'core',   -- core＝遊戲內建，GF＝GF.xlsx 法規手冊
  tags      TEXT NOT NULL DEFAULT '',
  emb_model TEXT,                   -- 產生向量的模型名稱，換模型時會自動重算
  embedding BLOB                    -- numpy float32，已正規化
);

-- GF.xlsx 法規手冊（一列一條法規，可在遊戲裡翻閱）
CREATE TABLE IF NOT EXISTS manual (
  id        TEXT PRIMARY KEY,       -- BK-01、CV-02…
  cat       TEXT NOT NULL,          -- 銀行法、民法…
  law       TEXT NOT NULL,          -- 第 32 條
  title     TEXT NOT NULL,
  summary   TEXT, scene TEXT, sop TEXT, checklist TEXT,
  violation TEXT, effect TEXT, owner TEXT,
  risk      TEXT,                   -- 高風險／中風險／低風險
  plain     TEXT,                   -- 白話說明（給一般民眾看）
  eg        TEXT,                   -- 生活例子
  todo      TEXT                    -- 您可以這樣做
);

-- 櫃台「預設問題」
CREATE TABLE IF NOT EXISTS game_qa (
  id    TEXT PRIMARY KEY,
  ord   INTEGER NOT NULL,
  q     TEXT NOT NULL,
  type  TEXT NOT NULL CHECK (type IN ('now','later')),  -- 當場說明 / 後續回覆
  rec   TEXT NOT NULL,
  lines TEXT NOT NULL,              -- JSON：[[台詞, 表情], ...]
  learn TEXT
);

CREATE TABLE IF NOT EXISTS learn (
  key  TEXT PRIMARY KEY,
  text TEXT NOT NULL
);

-- 玩家
CREATE TABLE IF NOT EXISTS players (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  token       TEXT NOT NULL,        -- 玩家端憑證（存在瀏覽器 localStorage），用來證明「這是我的紀錄」
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen   TEXT NOT NULL DEFAULT (datetime('now')),
  plays       INTEGER NOT NULL DEFAULT 0,       -- 開始遊戲的次數
  done_json   TEXT NOT NULL DEFAULT '[]',       -- 最近一次遊玩已完成的任務 id
  mistakes    INTEGER NOT NULL DEFAULT 0,       -- 最近一次遊玩的答錯次數
  finished    INTEGER NOT NULL DEFAULT 0,       -- 是否曾經通關
  rank        TEXT,                             -- 最近一次通關的稱號
  finished_at TEXT,
  best_score  INTEGER,                          -- 通關最高分（滿分 1000，答錯一次扣 20）
  best_at     TEXT,
  note        TEXT NOT NULL DEFAULT ''          -- 後台備註
);

-- 事件紀錄（任務完成、通關、自由提問…），後台統計用
CREATE TABLE IF NOT EXISTS events (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER,
  at        TEXT NOT NULL DEFAULT (datetime('now')),
  kind      TEXT NOT NULL,
  detail    TEXT
);

-- 自由提問紀錄
CREATE TABLE IF NOT EXISTS questions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  asked_at   TEXT NOT NULL DEFAULT (datetime('now')),
  player_id  INTEGER,
  question   TEXT NOT NULL,
  top_chunk  TEXT,
  top_score  REAL,
  answered   INTEGER NOT NULL DEFAULT 0   -- 1＝分數過門檻、有給出答案
);
