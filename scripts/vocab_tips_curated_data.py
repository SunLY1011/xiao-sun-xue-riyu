# -*- coding: utf-8 -*-
"""精品逐词知识卡文案 · 供 build-unit2 / build-lessons-9-24 生成器引用

单元真源：
  U1 L2–4   → vocab_tips_curated_u1.py  (build-u1-vocab-curated.py)
  U2 L5–8   → vocab_tips_curated_u2.py  (build-u2-vocab-curated.py)
  U3 L9–12  → vocab_tips_curated_u3.py  (build-u3-u5-u6-vocab-curated.py)
  U4 L13–16 → vocab_tips_curated_u4.py  (build-u4-vocab-curated.py)
  U5 L17–20 → vocab_tips_curated_u5.py  (build-u3-u5-u6-vocab-curated.py)
  U6 L21–24 → vocab_tips_curated_u6.py  (build-u3-u5-u6-vocab-curated.py)
"""

from vocab_tips_curated_u1 import U1_CURATED  # noqa: E402
from vocab_tips_curated_u2 import U2_CURATED  # noqa: E402
from vocab_tips_curated_u3 import U3_CURATED  # noqa: E402
from vocab_tips_curated_u4 import U4_CURATED  # noqa: E402
from vocab_tips_curated_u5 import U5_CURATED  # noqa: E402
from vocab_tips_curated_u6 import U6_CURATED  # noqa: E402

CURATED: dict[str, dict] = {}
CURATED.update(U1_CURATED)
CURATED.update(U2_CURATED)
CURATED.update(U3_CURATED)
CURATED.update(U4_CURATED)
CURATED.update(U5_CURATED)
CURATED.update(U6_CURATED)
