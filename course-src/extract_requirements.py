from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ATTACHMENTS = [
    Path(r"C:\Users\israe\.codex\attachments\bd409aa9-a858-4ed9-9636-8e4917f1ca8c\Pasted text.txt"),
    Path(r"C:\Users\israe\.codex\attachments\7a7a4c34-4bd7-4073-a4ce-c37fd0513c39\Pasted text.txt"),
]

def parse(path: Path, second: bool) -> list[dict]:
    text = path.read_text(encoding="utf-8")
    pattern = (
        r"(?m)^\d+\.\s+(\d+)\.\s+\[(P[0-3])\]\s+"
        if second else r"(?m)^(\d+)\.\s+\[(P[0-3])\]\s+"
    )
    matches = list(re.finditer(pattern, text))
    results = []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        body = text[match.end():end].strip()
        title, _, rest = body.partition("\n")
        results.append({
            "id": int(match.group(1)),
            "priority": match.group(2),
            "title": title.rstrip("."),
            "description": rest.strip(),
            "status": "pending",
            "evidence": [],
        })
    return results

requirements = parse(ATTACHMENTS[0], False) + parse(ATTACHMENTS[1], True)
requirements.sort(key=lambda item: item["id"])
assert [item["id"] for item in requirements] == list(range(1, 91))
assert {priority: sum(x["priority"] == priority for x in requirements)
        for priority in ("P0", "P1", "P2", "P3")} == {
    "P0": 20, "P1": 48, "P2": 21, "P3": 1,
}
(ROOT / "audit_requirements.json").write_text(
    json.dumps(requirements, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)
print(f"requirements={len(requirements)}")
