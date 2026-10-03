from __future__ import annotations

import importlib.util
import json
import math
import re
from collections import Counter
from pathlib import Path
from typing import Any

from extras import EXTRAS, DIAGNOSTIC

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parent
DIMENSIONS = (
    "novelty", "syntax", "composition", "state", "debugging",
    "files", "reading", "independence", "tools",
)
SCOPED_STAGES = {f"{i:02d}" for i in range(21)}
OPTIONAL_EXERCISE_IDS = {
    "05.05", "09.07", "12.09", "12.13", "14.07", "17.07",
    "20.02", "20.04", "20.05", "20.06", "20.07", "21.06",
}
EXPLANATION_FIELDS = {"mental_model", "worked_example", "common_trap", "why_it_matters"}
ACTIVE_RECALL_SCHEDULE = ["D+7", "D+21"]
KIND_BASE = {
    "PREDICT": (1, 1, 1, 1, 1, 1, 1, 1, 1),
    "TRACE": (1, 1, 2, 2, 1, 1, 2, 1, 1),
    "FADED": (2, 2, 2, 1, 1, 1, 1, 1, 1),
    "PARSONS": (2, 2, 2, 2, 1, 1, 1, 1, 1),
    "COMPARE": (2, 2, 3, 2, 1, 1, 2, 2, 1),
    "READ": (2, 1, 2, 2, 1, 2, 3, 2, 1),
    "DOCS": (2, 2, 2, 1, 1, 1, 3, 3, 2),
    "INVESTIGATE": (2, 2, 3, 3, 3, 2, 3, 3, 3),
    "MODIFY": (2, 2, 3, 3, 2, 2, 3, 3, 2),
    "MAKE": (3, 3, 3, 3, 2, 2, 2, 3, 2),
    "DEBUG": (2, 2, 3, 3, 4, 2, 3, 3, 2),
    "TEST": (2, 2, 3, 3, 3, 2, 3, 3, 3),
    "UI": (3, 3, 3, 3, 3, 3, 2, 3, 3),
    "TYPE": (3, 4, 4, 2, 2, 2, 3, 3, 3),
    "PROJECT": (3, 3, 4, 4, 3, 4, 4, 4, 3),
    "TRANSFER": (2, 2, 3, 2, 2, 2, 2, 4, 2),
}
DEFAULT_MINUTES = {
    "PREDICT": 6, "TRACE": 9, "FADED": 10, "PARSONS": 10,
    "COMPARE": 12, "READ": 10, "DOCS": 18, "INVESTIGATE": 20,
    "MODIFY": 22, "MAKE": 25, "DEBUG": 22, "TEST": 25,
    "UI": 35, "TYPE": 25, "PROJECT": 90, "TRANSFER": 22,
}
SCORING = {
    "PREDICT": "Compare resposta registrada antes de Run com sequência/valor previstos; confiança é diagnóstica.",
    "TRACE": "Compare estados e ordem; peça explicação curta sobre a primeira divergência.",
    "FADED": "Avalie somente as decisões retiradas e execute o arquivo completo.",
    "PARSONS": "Avalie ordem/seleção de blocos e comportamento final; não exija ordem entre blocos independentes.",
    "COMPARE": "Aceite escolha justificada por diferença semântica publicada.",
    "READ": "Rubrica de localização, fluxo de dados e intenção; nenhuma edição de código é exigida.",
    "DOCS": "Rubrica de assinatura, parâmetros, retorno, erros, compatibilidade e aplicação.",
    "INVESTIGATE": "Rubrica de hipótese, evidência da ferramenta, conclusão e reprodução.",
    "MODIFY": "Rode regressões antigas e novos casos; avalie mudança localizada.",
    "MAKE": "Aceite qualquer implementação que cumpra entrada, saída, erro e efeitos declarados.",
    "DEBUG": "Exija reprodução, causa, correção e regressão.",
    "TEST": "Execute teste escrito pelo aluno contra implementação correta e mutantes defeituosos.",
    "UI": "Teste DOM, teclado, foco, estados transitórios e fronteira de confiança.",
    "TYPE": "Rode typecheck, testes de tipo positivos/negativos e runtime onde necessário.",
    "PROJECT": "Rode critérios comportamentais e revisão humana para decisões abertas.",
    "TRANSFER": "Compare competência estrutural em domínio diferente e sem ajuda.",
}
LEGACY_KIND = {
    "recuperacao": "PREDICT", "previsao": "PREDICT", "tracing": "TRACE",
    "leitura": "READ", "parsons": "PARSONS", "reconstrucao": "PARSONS",
    "completar": "FADED", "lacunas": "FADED", "depuracao": "DEBUG",
    "implementacao": "MAKE", "mini-projeto": "PROJECT", "microprojeto": "PROJECT",
    "projeto": "PROJECT", "transferencia": "TRANSFER", "comparacao": "COMPARE",
    "revisao": "READ", "laboratorio": "INVESTIGATE", "configuracao": "MODIFY",
    "pesquisa": "DOCS", "tipos": "TYPE", "typecheck": "TYPE",
}
STAGE_REQUIRES = {
    "00": [], "01": [], "02": ["bindings.values"],
    "03": ["operators.basic"], "04": ["control.branch"], "05": ["functions.return"],
    "06": ["arrays.basic"], "07": ["functions.return", "arrays.basic"],
    "08": ["control.loop", "arrays.basic"], "09": ["functions.return"],
    "10": ["objects.identity", "functions.return"], "11": ["objects.identity", "html.tree_reading"],
    "12": ["functions.return"], "13": ["functions.return"], "14": ["functions.return"],
    "15": ["functions.return", "objects.identity"], "16": ["ts.basic"],
    "17": ["ts.basic"], "18": ["ts.basic"], "19": ["ts.generics"],
    "20": ["arrays.basic"], "21": ["functions.return"], "22": ["ts.basic", "modules.esm"],
    "23": ["functions.return", "testing.behavior"],
}
STAGE_INTRODUCES = {
    "00": ["execution.order", "environment.boundaries", "html.tree_reading", "modules.esm",
           "execution.contradiction", "execution.sequence", "execution.fill_console",
           "debug.first_error", "execution.make", "execution.explain_program"],
    "01": ["bindings.values", "primitives.types", "primitives.typeof",
           "bindings.reassignment", "bindings.declaration_order",
           "bindings.const_let_choice", "primitives.special_values",
           "bindings.template_literal", "bindings.configuration",
           "bindings.textual_profile"],
    "02": ["operators.basic", "number.model", "math.basic"],
    "03": ["control.branch", "control.loop"],
    "04": ["functions.return", "functions.decomposition"],
    "05": ["arrays.basic", "strings.basic", "regex.basic", "unicode.basic", "callbacks.basic"],
    "06": ["objects.identity", "objects.own", "serialization.json", "errors.try_catch"],
    "07": ["arrays.pipeline", "mapset.basic"],
    "08": ["algorithms.complexity", "algorithms.recursion"],
    "09": ["scope.lexical", "closures.basic"],
    "10": ["this.binding", "prototype.chain", "classes.basic"],
    "11": ["dom.basic", "events.propagation", "forms.basic", "storage.versioned", "modules.browser"],
    "12": ["async.promise", "http.basic", "fetch.basic", "date.time", "async.iterables"],
    "13": ["testing.behavior", "debugging.tools", "errors.throw", "errors.types", "errors.cause"],
    "14": ["modules.project_structure", "node.basics", "git.basics", "npm.safety"],
    "15": ["ts.basic", "ts.unknown", "ts.readonly"],
    "16": ["ts.unions", "ts.narrowing", "validation.manual"],
    "17": ["ts.generics", "ts.functions"],
    "18": ["ts.keyof_indexed_access", "ts.utility", "ts.satisfies", "ts.import_type"],
    "19": ["ts.advanced", "ts.branding"],
    "20": ["iterators.sync", "iterators.async", "streams.basic"],
    "21": ["performance.measure", "workers.basic", "resources.cleanup"],
    "22": ["ts.packages", "validation.schema"],
    "23": ["architecture.boundaries", "operations.observability"],
}
SEQUENCE_OVERRIDES = {
    "00": ["00.01", "00.02", "00.03", "00.04", "00.07", "00.05", "00.06", "00.08", "00.09"],
    "03": ["03.04", "03.05", "03.01", "03.02", "03.03", "03.06", "03.07", "03.08", "03.09"],
    "05": ["05.01", "05.03", "05.04", "05.06", "05.07", "05.10", "05.11", "05.02", "05.05", "05.08", "05.09"],
    "07": ["07.01", "07.02", "07.03", "07.04", "07.05", "07.06", "07.07", "07.10", "07.08", "07.09"],
    "11": ["11.09", "11.01", "11.11", "11.14", "11.02", "11.03", "11.04", "11.05", "11.06", "11.07", "11.12", "11.10", "11.08", "11.13"],
    "12": ["12.10", "12.11", "12.01", "12.04", "12.02", "12.03", "12.05", "12.06", "12.07", "12.09", "12.12", "12.13", "12.14", "12.08"],
    "16": ["16.01", "16.02", "16.03", "16.09", "16.04", "16.05", "16.10", "16.06", "16.07", "16.08"],
    "23": ["23.01", "23.02", "23.03", "23.04", "23.05", "23.06", "23.10", "23.11", "23.07", "23.09", "23.08"],
}

def detect_kind(label: str) -> str:
    lowered = label.lower()
    for needle, kind in LEGACY_KIND.items():
        if needle in lowered:
            return kind
    return "MAKE"

def case(value: str) -> dict[str, str]:
    assert " -> " in value, value
    given, expected = value.split(" -> ", 1)
    assert given.strip() and expected.strip()
    return {"given": given.strip(), "expected": expected.strip()}

def file_from_starter(value: str) -> list[dict[str, str]]:
    first, _, rest = value.partition(": ")
    if re.fullmatch(r"[\w.-]+\.(?:js|ts|json|html|css|md)", first):
        return [{"path": first, "content": rest}]
    return [{"path": "material.md", "content": value}]

def load_recipes() -> dict[str, dict]:
    merged = {}
    for path in sorted((ROOT / "recipes").glob("*.py")):
        if path.stem.startswith("_"):
            continue
        spec = importlib.util.spec_from_file_location("recipe_" + path.stem, path)
        assert spec and spec.loader
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        assert isinstance(module.CONTENT, dict)
        for eid, value in module.CONTENT.items():
            if eid in merged:
                raise ValueError(f"Duplicate recipe: {eid}")
            merged[eid] = value
    return merged

def make_records() -> list[dict]:
    # This index contains identity/ordering metadata only; exercise content lives in recipes.
    drafts = [
        {**item, "learner": {"prompt": item.get("prompt", "")}, "legacy_reference": {}}
        for item in json.loads((ROOT / "exercise_index.json").read_text(encoding="utf-8"))
    ]
    for eid, title, kind, prompt, audit_ids in EXTRAS:
        drafts.append({
            "id": eid, "title": title, "stage": eid[:2], "kind": kind,
            "learner": {"prompt": prompt}, "legacy_reference": {},
            "audit_ids": audit_ids, "origin": "third_edition",
        })
    for eid, title, kind, prompt, audit_ids in DIAGNOSTIC:
        drafts.append({
            "id": eid, "title": title, "stage": "D", "kind": kind,
            "learner": {"prompt": prompt}, "legacy_reference": {},
            "audit_ids": audit_ids, "origin": "third_edition",
        })
    ids = [item["id"] for item in drafts]
    assert len(ids) == len(set(ids))
    recipes = load_recipes()
    unknown = set(recipes) - set(ids)
    assert not unknown, f"Recipes without exercise: {sorted(unknown)}"
    by_id = {item["id"]: item for item in drafts}
    ordered = []
    for stage in ["D"] + [f"{i:02d}" for i in range(24)]:
        stage_ids = [item["id"] for item in drafts if item["stage"] == stage]
        override = SEQUENCE_OVERRIDES.get(stage, [])
        if override:
            assert set(override) <= set(stage_ids), (stage, set(override) - set(stage_ids))
            stage_ids = override + [eid for eid in sorted(stage_ids) if eid not in override]
        else:
            stage_ids.sort()
        ordered.extend(stage_ids)
    assert set(ordered) == set(ids)
    output = []
    for index, eid in enumerate(ordered):
        draft = by_id[eid]
        recipe = recipes.get(eid)
        stage = draft["stage"]
        if recipe is None:
            output.append({
                "id": eid, "title": draft["title"], "stage": stage,
                "status": "needs_contract",
                "missing": ["authored item recipe"],
                "legacy": draft,
            })
            continue
        kind = recipe["kind"] or (draft["kind"] if draft["kind"] in KIND_BASE else detect_kind(draft["kind"]))
        if kind not in KIND_BASE:
            raise ValueError((eid, kind))
        scoring = SCORING[kind]
        if stage == "02" and kind == "DEBUG":
            scoring = "Mostre o caso que falha, explique o operador escolhido, corrija e confira novamente os casos publicados."
        elif stage == "02" and kind == "MODIFY":
            scoring = "Confira os casos publicados antes e depois da mudança; explique o que alterou e por que as saídas cumprem o contrato."
        elif stage == "02" and kind == "MAKE":
            scoring = "Aceite qualquer cálculo que cumpra as entradas e saídas publicadas; não exigir tratamento de erro fora do domínio declarado."
        load = dict(zip(DIMENSIONS, KIND_BASE[kind]))
        load.update(recipe["load"])
        assert set(load) == set(DIMENSIONS) and all(isinstance(v, int) and 1 <= v <= 5 for v in load.values())
        display = min(5.0, max(1.0, round(sum(load.values()) / len(load) * 2) / 2))
        next_ids = list(recipe["next_ids"]) or ([ordered[index + 1]] if index + 1 < len(ordered) else [])
        if eid == "22.09":
            next_ids = ["23.01", "22.10"]
        elif eid == "22.10":
            next_ids = ["23.01"]
        runtime = recipe["runtime"] or ("browser evergreen" if stage == "11" else "Node.js 24 LTS")
        compatibility = recipe["compatibility"] or "Recursos básicos; confirmar cada API recente no runtime declarado"
        learner_prompt = recipe["prompt"] or draft["learner"]["prompt"]
        assert learner_prompt and " -> " in recipe["public"] and " -> " in recipe["hidden"], eid
        review = recipe["review"]
        if stage in SCOPED_STAGES:
            assert recipe["prompt"] and recipe["kind"] and recipe["estimated"], eid
            assert recipe["runtime"] and recipe["compatibility"], eid
            assert recipe["first_response"] and recipe["first_response_timing"], eid
            assert recipe["interaction"] and recipe["resources"], eid
            assert recipe["transfer_prompt"], eid
            assert recipe["explanation"] and set(recipe["explanation"]) == EXPLANATION_FIELDS, eid
            assert all(recipe["explanation"].values()), eid
            assert review and review["skill"] == recipe["skill"], eid
            assert list(review["schedule"]) == ACTIVE_RECALL_SCHEDULE, eid
            assert len(review["choices"]) >= 3 and review["answer"] in review["choices"], eid
            assert review["feedback_correct"] and review["feedback_incorrect"], eid
            assert recipe["transfer_prompt"].strip() != recipe["transfer"].strip(), eid
        output.append({
            "id": eid, "title": recipe.get("title") or draft["title"], "stage": stage,
            "origin": draft.get("origin", "second_edition"),
            "audit_ids": draft.get("audit_ids", []),
            "status": "contract_ready",
            "content_version": recipe.get("content_version", 1),
            "optional": bool(recipe.get("optional", False) or eid == "22.10" or eid in OPTIONAL_EXERCISE_IDS),
            "kind": kind,
            "primary_skill": recipe["skill"],
            "secondary_skills": list(recipe["secondary"]),
            "requires": list(dict.fromkeys((STAGE_REQUIRES.get(stage, []) + list(recipe["requires"])))),
            "introduces": list(dict.fromkeys([recipe["skill"], *recipe["secondary"]])) if stage == "02" else [recipe["skill"]],
            "difficulty": {**load, "display": display},
            "estimated_minutes": recipe["estimated"] or DEFAULT_MINUTES[kind],
            "runtime": runtime,
            "compatibility": compatibility,
            "learner": {
                "prompt": learner_prompt,
                "first_response": {
                    "action": recipe["first_response"],
                    "timing": recipe["first_response_timing"],
                },
                # Preserve the authored sequence when serialized: capture a
                # learner's first response before showing explanatory examples.
                "explanation": recipe["explanation"],
                "interaction": recipe["interaction"],
                "resources": list(recipe["resources"]),
                "starter_files": file_from_starter(recipe["starter"]),
                "assets": list(recipe["assets"]),
                "public_examples": [case(recipe["public"])],
                "public_tests": [{"fixture": case(recipe["public"]), "scoring": scoring}],
                "edge_contract": [recipe["hidden"]],
                "constraints": list(recipe["constraints"]),
                "visible_rubric": list(recipe["rubric"]) if stage == "01" else [x for x in [draft.get("legacy_reference", {}).get("expected", ""),
                                              *recipe["rubric"], scoring] if x],
                "docs_policy": recipe["docs"] or
                               ("Documentação oficial indicada por link e seção" if stage in ("D", "00", "01", "02", "03", "04") else
                                "Nome da API ou fonte oficial; aluno localiza detalhes"),
            },
            "platform": {
                "hidden_cases": [case(recipe["hidden"])],
                "oracle": recipe["solution"],
                "misconception_target": recipe["misconception"],
                "observable_failure": recipe["failure"],
                "diagnostic_question": recipe["question"],
                "hints": dict(zip(("conceptual", "decomposition", "analogous_example"), recipe["hints"])),
                "worked_solution": {"files": [{"path": "solution.md", "content": recipe["solution"]}],
                                    "explanation": recipe["solution"]},
                "transfer": {"prompt": recipe["transfer_prompt"], "expected": case(recipe["transfer"])["expected"]},
                "mastery_evidence": [scoring,
                                     "Acerto independente sem solução e transferência isomórfica posterior são evidências distintas."],
                "telemetry": ["first_attempt_without_hint", "error_class", "confidence_if_prediction",
                              "time_to_first_correct", "hint_level", "solution_opened",
                              "retention_d7", "retention_d21", "transfer_outcome"],
                "active_recall": review,
                "next_ids": next_ids,
            },
        })
    return apply_stage00_preparation(output)


def apply_stage00_preparation(output: list[dict[str, Any]]) -> list[dict[str, Any]]:
    # Stage 00 teaches each new concept before requiring a first response.
    preparation = json.loads((ROOT / "stage00-preparation.json").read_text(encoding="utf-8"))
    for item in output:
        if item["stage"] != "00":
            continue
        lesson = item["learner"]
        teaching = preparation[item["id"]]
        item["title"] = teaching["title"]
        item["content_version"] = max(item.get("content_version", 1), 3)
        lesson["preparation"] = teaching
        lesson["prompt"] = teaching["prompt"]
        lesson["interaction"] = teaching["response"]
        lesson["first_response"] = {
            "action": teaching["response"],
            "timing": "Depois de ler a explicação e executar o arquivo intacto, antes da primeira alteração."
            if teaching["mode"] == "debug" else "Depois de ler a explicação e o exemplo resolvido, antes de preencher sua análise."
            if teaching["mode"] == "written" else "Depois de ler a explicação e o exemplo resolvido, antes de executar sua tentativa.",
        }
        lesson["explanation"]["mental_model"] = teaching["mental"]
        lesson["explanation"]["worked_example"] = " ".join(teaching["example"]["walkthrough"])
        lesson["visible_rubric"] = teaching["rubric"]
        lesson["resources"] = [f'{doc["title"]}: {doc["url"]}. {doc["task"]}' for doc in teaching["docs"]]
        lesson["constraints"] = []
        if "starterFiles" in teaching:
            lesson["starter_files"] = teaching["starterFiles"]
        review = teaching["review"]
        item["platform"]["active_recall"] = {
            "prompt": review["prompt"], "choices": review["choices"],
            "answer": review["choices"][review["answer"]],
            "feedback_correct": review["correctFeedback"],
            "feedback_incorrect": review["incorrectFeedback"],
            "skill": item["primary_skill"], "schedule": ACTIVE_RECALL_SCHEDULE,
        }
    return output

if __name__ == "__main__":
    resolved = make_records()
    counts = Counter(item["status"] for item in resolved)
    (ROOT / "resolved_preview.json").write_text(json.dumps(resolved, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"items={len(resolved)} statuses={dict(counts)}")
