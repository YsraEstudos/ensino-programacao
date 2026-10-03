"""Compile a curriculum DAG from the editorial records, failing on future prerequisites."""
from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

from compile_content import STAGE_INTRODUCES, STAGE_REQUIRES, make_records

ROOT = Path(__file__).resolve().parent
records = make_records()
stage_order = ["D"] + [f"{n:02d}" for n in range(24)]
stage_rank = {stage: i for i, stage in enumerate(stage_order)}
introduced_at = {}
for stage in stage_order:
    for concept in STAGE_INTRODUCES.get(stage, []):
        if concept in introduced_at:
            raise ValueError(f"Concept introduced twice: {concept}")
        introduced_at[concept] = stage

# Preserve aggregate aliases for later stages while exposing Stage 02 blocks.
for item in records:
    if item["stage"] == "02":
        for concept in item["introduces"]:
            introduced_at.setdefault(concept, item["stage"])

concept_edges = {
    "operators.predict": ["bindings.values"],
    "operators.arithmetic": ["operators.predict"],
    "operators.comparison": ["operators.predict"],
    "operators.logical": ["operators.comparison"],
    "operators.basic": ["operators.arithmetic", "operators.logical"],
    "operators.falsy_nullish": ["operators.logical"],
    "operators.boolean_validation": ["operators.comparison", "operators.logical"],
    "coercion.number_validation": ["operators.boolean_validation"],
    "number.model": ["coercion.number_validation"],
    "coercion.explicit": ["coercion.number_validation"],
    "operators.nullish_fallback": ["operators.falsy_nullish"],
    "operators.discount_expression": ["operators.arithmetic"],
    "operators.preferences": ["operators.nullish_fallback"],
    "operators.scoreboard": ["operators.arithmetic", "operators.preferences"],
    "math.rounding": ["operators.arithmetic", "coercion.number_validation"],
    "math.basic": ["math.rounding"],
    "math.random": ["math.rounding"],
    "number.ieee754": ["number.model", "operators.comparison"],
    "number.safe_integers": ["number.ieee754"],
    "number.tolerance": ["math.rounding", "number.ieee754"],
    "bindings.values": ["execution.order"],
    "primitives.typeof": ["primitives.types"],
    "bindings.reassignment": ["bindings.values"],
    "bindings.declaration_order": ["bindings.values", "bindings.reassignment"],
    "bindings.const_let_choice": ["bindings.reassignment"],
    "primitives.special_values": ["primitives.typeof"],
    "bindings.template_literal": ["bindings.values"],
    "bindings.configuration": ["bindings.const_let_choice", "bindings.template_literal"],
    "bindings.textual_profile": ["bindings.reassignment", "bindings.const_let_choice", "bindings.template_literal"],
    "control.loop": ["control.branch"],
    "regex.basic": ["strings.basic"],
    "unicode.basic": ["strings.basic"],
    "callbacks.basic": ["functions.return"],
    "arrays.pipeline": ["callbacks.basic", "arrays.basic"],
    "mapset.basic": ["objects.identity"],
    "closures.basic": ["scope.lexical"],
    "prototype.chain": ["objects.own"],
    "classes.basic": ["prototype.chain"],
    "dom.basic": ["html.tree_reading", "objects.identity"],
    "events.propagation": ["dom.basic"],
    "forms.basic": ["dom.basic"],
    "modules.browser": ["dom.basic"],
    "modules.project_structure": ["modules.esm", "node.basics"],
    "errors.try_catch": ["functions.return"],
    "errors.types": ["errors.throw"],
    "http.basic": ["environment.boundaries"],
    "fetch.basic": ["http.basic", "async.promise"],
    "async.promise": ["callbacks.basic"],
    "date.time": ["number.model"],
    "testing.behavior": ["functions.return"],
    "node.basics": ["environment.boundaries"],
    "ts.basic": ["modules.esm"],
    "ts.unions": ["ts.basic"],
    "validation.manual": ["ts.unknown"],
    "ts.generics": ["ts.basic"],
    "ts.keyof_indexed_access": ["ts.generics"],
    "ts.utility": ["ts.generics"],
    "ts.advanced": ["ts.utility"],
    "iterators.async": ["async.iterables"],
    "streams.basic": ["iterators.async"],
    "workers.basic": ["performance.measure"],
    "ts.packages": ["ts.basic", "modules.esm"],
    "architecture.boundaries": ["validation.manual", "testing.behavior"],
}

for concept, parents in concept_edges.items():
    if concept not in introduced_at:
        raise ValueError(f"Unknown concept: {concept}")
    for parent in parents:
        if parent not in introduced_at:
            raise ValueError(f"Unknown prerequisite: {parent}")
        if stage_rank[introduced_at[parent]] > stage_rank[introduced_at[concept]]:
            raise ValueError(f"Future concept prerequisite: {parent} -> {concept}")

edges = []
for concept, parents in concept_edges.items():
    edges.extend({"from": p, "to": concept, "kind": "concept"} for p in parents)
for item in records:
    if item["status"] != "contract_ready":
        raise ValueError(f"Incomplete item: {item['id']}")
    for required in item["requires"]:
        if required not in introduced_at:
            raise ValueError(f"Unknown item prerequisite: {item['id']} -> {required}")
        if stage_rank[introduced_at[required]] > stage_rank[item["stage"]]:
            raise ValueError(f"Future item prerequisite: {item['id']} -> {required}")
        edges.append({"from": required, "to": item["id"], "kind": "item"})

adj = defaultdict(list)
for edge in edges:
    adj[edge["from"]].append(edge["to"])
color = {}
def visit(node: str) -> None:
    if color.get(node) == 1:
        raise ValueError(f"Cycle at {node}")
    if color.get(node) == 2:
        return
    color[node] = 1
    for child in adj[node]:
        visit(child)
    color[node] = 2
for node in list(introduced_at) + [r["id"] for r in records]:
    visit(node)

output = {
    "version": "3.1",
    "retired_redirects": {"15.05": "16.09"},
    "concepts": [{"id": c, "introduced_at": s, "requires": concept_edges.get(c, [])} for c, s in introduced_at.items()],
    "activities": [{"id": x["id"], "stage": x["stage"], "requires": x["requires"], "introduces": x["introduces"]} for x in records],
    "edges": edges,
}
(ROOT / "concept_graph.json").write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"concepts={len(introduced_at)} activities={len(records)} edges={len(edges)} acyclic=yes")
