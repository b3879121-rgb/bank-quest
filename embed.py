"""文字向量化。

優先使用 sentence-transformers 的 paraphrase-multilingual-MiniLM-L12-v2（和你之前 Colab / FAISS 用的同一個模型）。
如果沒安裝或下載不到模型，就退回「字元二元組雜湊向量」：不需要任何套件，
適合先把整條流程跑通，但語意理解比不上真正的模型。
設定環境變數 BANKQUEST_EMBED=hash 可強制使用備援方案。
"""
import os
import re
import zlib

import numpy as np

_ST_NAME = "paraphrase-multilingual-MiniLM-L12-v2"
_HASH_DIM = 2048
_NUM = str.maketrans("一二三四五六七八九", "123456789")
STOP_CHARS = "的了是嗎有在不可以怎麼什之與及或就都也我你他要會能呢吧還被把給跟和對於為並且其該等應得如此這那一個"
_STOP = str.maketrans("", "", STOP_CHARS)
_model = None
_tried = False
MODEL_NAME = "hash-bigram-2048"


def _load():
    global _model, _tried, MODEL_NAME
    if _tried:
        return
    _tried = True
    if os.environ.get("BANKQUEST_EMBED", "").lower() == "hash":
        return
    try:
        from sentence_transformers import SentenceTransformer

        _model = SentenceTransformer(_ST_NAME)
        MODEL_NAME = _ST_NAME
    except Exception as e:  # 沒安裝、沒網路、模型下載失敗都走備援
        print(f"[embed] 無法載入 {_ST_NAME}（{type(e).__name__}），改用雜湊向量備援")


def model_name():
    _load()
    return MODEL_NAME


def _hash_vec(text):
    t = text.translate(_NUM)
    t = re.sub(r"[\s，。、；：！？「」『』（）()\[\]【】,.!?;:\"'—\-]+", "", t.lower()).translate(_STOP)
    v = np.zeros(_HASH_DIM, dtype=np.float32)
    for ch in t:
        v[zlib.crc32(ch.encode()) % _HASH_DIM] += 0.1
    for i in range(len(t) - 1):
        v[zlib.crc32(t[i : i + 2].encode()) % _HASH_DIM] += 1.0
    n = np.linalg.norm(v)
    return v / n if n else v


def embed(texts):
    """回傳 (n, d) 的 float32 陣列，每列已做 L2 正規化（內積 = 餘弦相似度）。"""
    _load()
    if _model is not None:
        return np.asarray(_model.encode(list(texts), normalize_embeddings=True), dtype=np.float32)
    return np.vstack([_hash_vec(t) for t in texts]).astype(np.float32)
