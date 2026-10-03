from __future__ import annotations

from typing import Any

LESSON_PARTS = ("mental_model", "worked_example", "common_trap", "why_it_matters")
REVIEW_SCHEDULE = ("D+7", "D+21")

def _review_record(skill: str, review: dict[str, Any] | None) -> dict[str, Any] | None:
    if review is None:
        return None
    choices = tuple(review.get("choices", ()))
    answer = review.get("answer")
    assert review.get("prompt") and len(choices) >= 3 and len(set(choices)) == len(choices)
    assert answer in choices and review.get("feedback_correct") and review.get("feedback_incorrect")
    return {
        "prompt": review["prompt"],
        "choices": choices,
        "answer": answer,
        "feedback_correct": review["feedback_correct"],
        "feedback_incorrect": review["feedback_incorrect"],
        "skill": skill,
        "schedule": REVIEW_SCHEDULE,
    }

def E(
    skill: str,
    starter: str,
    public: str,
    hidden: str,
    misconception: str,
    failure: str,
    question: str,
    hints: tuple[str, str, str],
    solution: str,
    transfer: str,
    *,
    prompt: str | None = None,
    kind: str | None = None,
    requires: tuple[str, ...] = (),
    secondary: tuple[str, ...] = (),
    constraints: tuple[str, ...] = (),
    runtime: str | None = None,
    compatibility: str | None = None,
    estimated: int | None = None,
    load: dict[str, int] | None = None,
    docs: str | None = None,
    assets: tuple[str, ...] = (),
    rubric: tuple[str, ...] = (),
    next_ids: tuple[str, ...] = (),
    optional: bool = False,
    title: str | None = None,
    content_version: int = 1,
    explanation: dict[str, str] | None = None,
    first_response: str | None = None,
    first_response_timing: str | None = None,
    interaction: str | None = None,
    resources: tuple[str, ...] = (),
    review: dict[str, Any] | None = None,
    transfer_prompt: str | None = None,
) -> dict[str, Any]:
    """Author one fully differentiated item in a compact, reviewable form.

    Public and hidden cases use semicolons between cases and ' -> ' between
    given and expected.  The publisher expands them into explicit case objects.
    """
    assert skill and starter and public and hidden and misconception
    assert failure and question and all(hints) and solution and transfer
    if explanation is not None:
        assert all(explanation.get(part) for part in LESSON_PARTS)
    assert bool(first_response) == bool(first_response_timing)
    return {
        "skill": skill,
        "starter": starter,
        "public": public,
        "hidden": hidden,
        "misconception": misconception,
        "failure": failure,
        "question": question,
        "hints": hints,
        "solution": solution,
        "transfer": transfer,
        "prompt": prompt,
        "kind": kind,
        "requires": requires,
        "secondary": secondary,
        "constraints": constraints,
        "runtime": runtime,
        "compatibility": compatibility,
        "estimated": estimated,
        "load": load or {},
        "docs": docs,
        "assets": assets,
        "rubric": rubric,
        "next_ids": next_ids,
        "optional": optional,
        "title": title,
        "content_version": content_version,
        "explanation": explanation,
        "first_response": first_response,
        "first_response_timing": first_response_timing,
        "interaction": interaction,
        "resources": resources,
        "review": _review_record(skill, review),
        "transfer_prompt": transfer_prompt,
    }

def C(skill: str, starter: str, public: str, hidden: str,
      misconception: str, hints: tuple[str, str, str],
      solution: str, transfer: str, *, failure: str | None = None,
      **kwargs: Any) -> dict[str, Any]:
    """Concise authoring for individually specified later-stage contracts."""
    if failure is None:
        edge = hidden.split(";", 1)[0].strip()
        if " -> " in edge:
            given, expected = edge.split(" -> ", 1)
            failure = (f"Na entrada `{given}`, a saída observável não corresponde a `{expected}`; "
                       f"a divergência é compatível com esta hipótese: {misconception}")
        else:
            failure = (f"Na borda `{edge}`, observe a saída e compare-a com o contrato publicado; "
                       f"esta interpretação incorreta causa a falha: {misconception}")
    return E(skill, starter, public, hidden, misconception,
             failure,
             f"Qual evidência no resultado diferencia este erro: {misconception}",
             hints, solution, transfer, **kwargs)
