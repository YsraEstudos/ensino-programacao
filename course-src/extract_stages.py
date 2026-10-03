from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT.parent / "tmp" / "pdfs" / "source-layout.txt"
STAGES = ROOT / "stages"
STAGES.mkdir(exist_ok=True)
text = SOURCE.read_text(encoding="utf-8")
starts = list(re.finditer(r"(?m)^ETAPA (\d{2}) - ", text))
assert len(starts) == 24

for index, start in enumerate(starts):
    stage = start.group(1)
    end = starts[index + 1].start() if index + 1 < len(starts) else len(text)
    section = text[start.start():end]
    marker = section.find("Exercicios especificados para o site")
    assert marker > 0, stage
    intro = section[:marker]
    intro = re.sub(r"(?m)^--- PAGE \d+ ---\s*$", "", intro)
    intro = re.sub(r"(?m)^JavaScript \+ TypeScript - 2a edicao auditada e expandida\s*$", "", intro)
    intro = re.sub(r"(?m)^\d{1,3}\s*$", "", intro)
    intro = re.sub(r"\n{3,}", "\n\n", intro).strip() + "\n"
    (STAGES / f"{stage}.txt").write_text(intro, encoding="utf-8")
print(f"stage_introductions={len(starts)}")
