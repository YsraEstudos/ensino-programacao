from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parent
manifest = json.loads(
    (PROJECT / "output" / "pdf" / "manifesto_exercicios_site.json").read_text(encoding="utf-8")
)
target_dir = ROOT / "exercises"
target_dir.mkdir(parents=True, exist_ok=True)

for stage in range(24):
    sid = f"{stage:02d}"
    target = target_dir / f"{sid}.json"
    if target.exists():
        raise RuntimeError(f"Refusing to replace authored content: {target}")
    records = []
    for old in manifest["items"]:
        if old["stage"] != sid:
            continue
        legacy = old.get("legacy_content", {})
        records.append({
            "id": old["id"],
            "title": old["title"],
            "stage": sid,
            "kind": legacy.get("format", ""),
            "primary_skill": "",
            "secondary_skills": [],
            "requires": [],
            "introduces": [],
            "difficulty": {},
            "estimated_minutes": None,
            "runtime": "",
            "compatibility": "",
            "learner": {
                "prompt": legacy.get("learner_prompt", ""),
                "starter_files": [],
                "assets": [],
                "public_examples": [],
                "public_tests": [],
                "constraints": [],
                "visible_rubric": [],
                "docs_policy": "",
            },
            "platform": {
                "hidden_cases": [],
                "oracle": "",
                "misconception_target": "",
                "observable_failure": "",
                "diagnostic_question": "",
                "hints": {"conceptual": "", "decomposition": "", "analogous_example": ""},
                "worked_solution": {"files": [], "explanation": ""},
                "transfer": {"prompt": "", "expected": ""},
                "mastery_evidence": [],
                "telemetry": [],
                "next_ids": [],
            },
            "legacy_reference": {
                "expected": legacy.get("legacy_expected", ""),
                "edge": legacy.get("legacy_hidden_edge", ""),
                "diagnostic": legacy.get("legacy_diagnostic", ""),
                "hint1": legacy.get("legacy_hint_1", ""),
                "hint2": legacy.get("legacy_hint_2", ""),
            },
        })
    target.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"created 24 stage files with {manifest['total']} draft records")
