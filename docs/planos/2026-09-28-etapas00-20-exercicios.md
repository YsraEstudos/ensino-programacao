# DevPath Exercises 00–20 Improvement Plan

> Registro histórico. Os caminhos, comandos e distribuições abaixo descrevem a estrutura da época; não devem orientar a manutenção atual. Consulte [a organização atual](../organizacao-projeto.md) e execute `npm.cmd run build:curriculum` dentro de `devpath-publish/`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to execute the three editorial workstreams. Each stage range has one owner; do not edit another agent's recipe files. Steps use checkbox syntax for tracking.

**Goal:** Turn the 217 activities in stages 00–20 into an accessible, coherent path from guided code reading to independent implementation and software-maintenance judgment, while preserving the third-edition course contracts and the current live-site boundary.

**Architecture:** Keep `course-src/recipes/`, `course-src/stages/`, and `course-src/bridges.md` as authored sources. Treat `course-src/resolved_preview.json`, the PDF, and generated graphs as derived or versioned review artifacts; do not bulk-rewrite legacy JSON scaffolds. Author activities through reusable interaction engines and a shared learning contract, then release stage groups only after their runner, review, accessibility, and runtime requirements are verified.

**Tech Stack:** Existing Python content compiler and recipe API, JSON preview and concept graph, current browser-based DevPath, Node/TypeScript/browser runners as supported by each activity's declared runtime. Add no new runtime dependency without a demonstrated need.

**Spec:** `C:\Users\israe\Downloads\JavaScript_TypeScript_Roteiro_do_Site_3a_Edicao.pdf`; user-provided design references `C:\Users\israe\.codex\attachments\0794c127-db06-4867-ad7a-e0bdd6152393\Pasted text.txt` and `C:\Users\israe\.codex\attachments\013f80a0-6d06-48b0-87ba-a9bbf8f7bd85\Pasted text.txt`; `course-src/implementation_protocol.md`; `course-src/site_spec.md`; `docs/guia-adicionar-exercicio.md`.

## Global Constraints

- The scoped curriculum is stages 00–20 of the third edition: exactly 217 activities. Stage D and stages 21–23 are outside this authoring scope.
- The supplied PDF and `course-src/resolved_preview.json` describe 254 `contract_ready` activities. `course-src/recipes/*.py` and `course-src/stages/*.txt` are the editable content sources; `resolved_preview.json` is compiler output. `course-src/exercises/*.json` contains an older, incomplete activity subset and is not the 217-card source of truth.
- The current app's active curriculum is only 00.01–00.09 plus 01.01. Making a card `contract_ready` does not make its runner implemented or its card publishable. Preserve the current live surface until the corresponding engine and review flow are ready.
- Do not turn the path into a collection of algorithm puzzles. Connect code practice to small products and authentic maintenance tasks, and gradually shift from “follow these steps” to requirements, evidence, and independent decisions.
- A Parsons or prediction task alone is practice, not independent mastery. A completion-bearing activity must require learner-authored evidence: code, a test, a diagnosis, a documented decision, or an explanation appropriate to its objective. Reordering blocks alone cannot mark a programming objective mastered.
- Teach prerequisites before requiring them. Use method-neutral acceptance criteria unless selecting the method is the stated learning objective. Accept behaviorally equivalent solutions.
- A hidden test may vary inputs, ordering, or published boundary conditions; it must not add an unpublished rule or enforce a preferred implementation.
- Time is a friction signal, not an early-stage score. Hints, opening a solution, or a technical runner failure must not be mislabeled as independent mastery or learner error.
- Use deterministic fixtures for network and time. Run learner code in an isolated environment with declared CPU, memory, time, output, file, and network limits. Do not put full source code, secrets, or personal data into telemetry by default.
- Prefer native HTML semantics, keyboard operation, visible focus, announced status, reduced-motion support, and safe rendering of untrusted text. Accessibility is judged by successful use, not ARIA count.
- Add property-based checks for pure calculations and validators where they add value; use a targeted mutation to prove that the exercise's tests detect its named misconception. Do not add irrelevant test rituals to reading or design tasks.
- Use the PDF's declared runtime baseline or a reviewed fallback. Recheck unstable API compatibility before release.
- No Git repository is present in this checkout. Do not initialize Git or make commit-based recovery assumptions.

## Review Focus

1. **Source/version disagreement:** compare the PDF, recipes, bridges, compiled preview, activity counts, IDs, and retirement redirects; never edit a derived preview as the only source change.
2. **Assessment validity:** verify that every hidden case follows a visible rule, each distractor identifies a plausible misconception, and multiple valid strategies pass when the method is not being assessed.
3. **Learning transfer:** confirm the path fades support and later asks for a new-domain task without the old starter or worked solution.
4. **Runtime and execution boundary:** ensure a feature's runtime, compatibility, deterministic fixtures, and runner are explicitly declared; technical failures are not learner failures.
5. **Inclusive and safe interaction:** test keyboard-only use, focus, small screens, reduced motion, assistive feedback, hostile-looking text inputs, repeated actions, and privacy-safe event logging.

---

## Pedagogical Design

### Shared activity flow

1. State one observable outcome and why it matters in a program or product.
2. Ask for a small first response before execution: a prediction, line-by-line state, hypothesis, comparison, test case, or tool choice. For prediction tasks, save the prediction and optional confidence before Run.
3. Give a short bridge lesson: one mental model, a worked example with named subgoals, one common trap, and relevant official documentation. Difficult concepts get multiple progressively less-supported examples, not one dense lecture.
4. Move from supported construction to learner authorship: trace/explain → reorder or fill selected gaps → make a localized change → write an implementation or test → solve a transfer task with a different domain. A mastered skill should not keep the same scaffold by default.
5. Execute or inspect evidence. Point to the first informative divergence, explain its category, and ask a diagnostic question before offering the next hint.
6. Reveal three distinct hints one at a time: concept, decomposition/where to inspect, analogous example. The last hint still leaves work for the learner. Show the worked answer only after an attempt or explicit request, then schedule independent transfer.
7. Ask for a short reflection only when the mental model matters (references, closures, `this`, async, narrowing, modules, or architecture), not on every card.
8. Attach at least one active-recall question to every completed exercise, linked to its skill and review schedule. The question needs plausible wrong answers and explanatory feedback. Current generated contracts have no `review` field, so adding this data contract and its site integration is a required work item.

### Reusable engines

Build and reuse a small set of engines instead of inventing an interface per card: Code Runner, Prediction/Trace, Faded Parsons, Bug Lab, Test Lab, Refactor Lab, Codebase Lab, Git Lab, PR Simulator, API Lab, Environment Lab, Production Lab, Architecture/Trade-off Lab, and AI Review Lab. These are content modes and future platform capabilities, not a mandate to put all 15 into stages 00–20. Database, production incidents, full system design, ADRs, and advanced deployment belong in later stages; keep them out of 00–20 except for prerequisites explicitly present in the PDF.

### Stage-by-stage authoring and interaction map

Every row is an authoring target for each activity in that stage, including its existing cards and additions. The activity ledger and exact ordering stay in the PDF/preview; the agent audit will attach exact activity IDs and any needed changes before editing.

| Stage | Cards | Teaching focus, learner input, interaction, and resources |
|---|---:|---|
| 00 — Ambiente e leitura de código | 9 | Read and predict before editing; learner writes output/order, labels an error, then makes a tiny code change. Use an annotated console, line stepping, and browser-vs-Node API cards. No unexplained variables or speed grading. |
| 01 — Valores e tipos | 9 | Have the learner classify and predict values, then edit literal/variable code and explain a mismatch. Use a binding/value table and inline runtime output; distinguish `0`, `false`, `null`, and empty text. |
| 02 — Operadores, Math e Number | 12 | Record a prediction before evaluating, then implement small calculations with explicit input/output rules. Use expression trees, boundary sliders, magnitude comparison, and generated finite/invalid cases; explain scale-sensitive numeric tolerance. |
| 03 — Decisões e repetição | 9 | Ask which condition/iteration is needed only after stating the behavior. Learner traces branches, fills loop structure, then writes a solution from examples and edge cases. Use branch/loop visualizers and counterexamples. |
| 04 — Funções e decomposição | 10 | Explain inputs, return, and effects; learner predicts a call, decomposes a requirement, then writes or changes a function and tests it. Use input/transform/output panels and naming review. |
| 05 — Strings, arrays, regex e Unicode | 11 | Begin with sample data and observed text behavior; learner predicts transformations, selects an approach, then implements it. Use string/array inspectors and Unicode examples; teach regex after core string operations. |
| 06 — Objetos, referências e JSON | 10 | Draw reference/alias changes before execution, then write an update or serialization operation. Use heap/reference diagrams, own-vs-inherited property inspection, and JSON round trips with invalid input. |
| 07 — Callbacks, coleções e pipelines | 10 | Present a data transformation without naming `map`, `reduce`, `Map`, or object as the answer. Learner compares options, tests one choice, and explains trade-offs. Use small data tables and equivalent implementations. |
| 08 — Algoritmos e complexidade | 8 | Ask for a predicted result and complexity estimate before Run; then write a simple algorithm, measure it, and revise the estimate. Use call-stack and operation-count visualizers; do not make speed a proxy for learning. |
| 09 — Escopo e closures | 8 | Have the learner trace which binding a function reads before explaining a closure; then write or repair a callback using captured state. Use scope-chain diagrams, lifetime controls, and a second contrasting example. |
| 10 — this, protótipos e classes | 8 | Ask the learner to predict receiver/prototype lookup at the call site; then modify a small object/class implementation. Use call-site highlighting and prototype-chain inspection; include “when not to use a class.” |
| 11 — DOM, eventos, formulário e Kanban | 14 | Before Run, predict event order/target and form values; then build safe components and delegated handlers. Use a browser DOM sandbox, event-path visualization, keyboard/focus checks, repeated `FormData`, and a persistent Kanban V1. |
| 12 — HTTP, assincronismo e tempo | 14 | Read HTTP status/headers/body before `fetch`; trace task queues before execution; then implement cancellation, retry, and a deterministic API dashboard. Use a request/response inspector, controllable latency/order, fake clock, and body-consumption state. |
| 13 — Teste, debugger e manutenção do Kanban | 14 | Start with a failing test or user symptom. Learner writes a hypothesis and minimal reproduction before changing code; then writes regression tests and makes a local patch to Kanban V2. Use debugger, fake timers, test output, DOM keyboard tests, and a small unfamiliar module. |
| 14 — ESM, Node, npm e Git | 13 | Learner draws import dependencies and predicts runtime behavior before using a constrained terminal/repository. Then write package scripts/config and implement a modular notes CLI. Use file tree, dependency graph, `git diff`, simple conflict resolution, and dependency-risk comparison. |
| 15 — TypeScript: contratos e runtime | 10 | Ask learners to interpret compiler errors before editing types; then write the minimum strict annotations and handle external `unknown` data at runtime. Use compiler diagnostics, inferred-type display, and strict-option toggles. |
| 16 — Unions, narrowing e validação | 10 | Have learners identify impossible states before modeling a discriminated union; then write guards/predicates and update exhaustiveness after a requirement change. Use state diagrams and positive/negative type tests, paired with runtime-invalid data. |
| 17 — Generics e APIs reutilizáveis | 9 | Start with a choice: concrete type, union, overload, or generic. Learner justifies the relationship, then writes a repository/cache contract and type tests. Use inference inspection and compiler errors as feedback. |
| 18 — Utility types e relações entre tipos | 10 | Learner derives a type from one source of truth, expands it manually, then writes a mapped/configuration contract. Use before/after type expansion, `satisfies` comparisons, and negative compile cases. |
| 19 — Tipos avançados com propósito | 9 | Predict conditional/mapped results manually; then write a small type transformation and decide whether its abstraction is worth maintaining. Use type-test panels, named intermediate types, compiler-message comparison, and a human-readable review rubric. |
| 20 — Iteradores, streams e bytes | 10 | Trace `next()` before using `for...of`; then write a generator and a lazy pipeline. Use stepwise iterator state, an infinite source with `take`, a slow stream consumer/backpressure control, and UTF-8 round trips. Keep Proxy as a bounded experiment with trade-off reflection. |

### Long-running project and professional-readiness boundary

- Use small early exercises to build reusable knowledge, not 20 unrelated toy apps. Preserve the PDF's Kanban V1 at 11.08 and return to the same codebase for migration, tests, keyboard/focus, and regressions at 13.14.
- Make checkpoint projects (04.09 functions, 11.08 DOM, 12.08 async, 15.08 TypeScript) assessment moments: publish requirements and allowed documentation, not a step-by-step tutorial. If prerequisites are weak, route to a short bridge before the checkpoint.
- Introduce codebase reading and localized modifications by stages 13–14, when tests, modules, and Git are taught. The first change to unfamiliar software includes README, tests, issue, repro, diff, and regression acceptance.
- Keep higher-level job-readiness ideas staged correctly: basic API behavior in 12; test/debug maintenance in 13; Git/tooling in 14; type/API design in 15–19; streams in 20. Full PR review, database labs, Docker/CI troubleshooting, performance operations, production incidents, system design, ADRs, and high-stakes trade-offs remain candidates for stages 21–23 or a later roadmap.
- Add AI Review as optional, explicit practice only after the learner has made an independent attempt: inspect generated code, verify documentation/API existence, run tests, explain the result, and retain a no-AI transfer check. AI cannot change acceptance criteria, hidden oracles, or stored learner code without consent.

## File Structure and Ownership

| Source | Responsibility |
|---|---|
| `course-src/recipes/00.py`–`20.py` | Authored card contracts for the 217 scoped activities; three agent ranges own disjoint files. |
| `course-src/recipe_api.py` | Shared recipe shape, including the planned review-question data field and any small validation helpers. |
| `course-src/stages/00.txt`–`20.txt` and `course-src/bridges.md` | Stage outcomes, prerequisites, mental models, worked examples, and pre-practice bridges. |
| `course-src/compile_content.py`, `build_graph.py`, `build_coverage.py` | Stage/concept prerequisites, graph edges, and audit evidence mapping; integrator-owned sources. |
| `course-src/resolved_preview.json` | Generated review artifact only; regenerate through the compiler. |
| `course-src/concept_graph.json`, `audit_coverage.json` | Generated prerequisite and traceability outputs; regenerate and compare rather than hand-editing. |
| Existing browser app/runner | Integration target only after engine capability is inspected; current README limits the active experience to early exercises. |

No agent may touch `recipe_api.py`, shared stage/bridge files, generated preview/graph, app code, or another range's recipes during its authoring task. The integrator handles shared schema and release changes after the three editorial reviews.

## Incremental Work Plan

### Task 1: Freeze the content baseline and reconcile sources

**Files:** Read `course-src/resolved_preview.json`, `course-src/recipes/`, `course-src/stages/`, `course-src/bridges.md`, `course-src/extras.py`, `course-src/implementation_protocol.md`, `course-src/site_spec.md`, the PDF, and current `README.md`.

- [ ] Record the stage counts (9, 9, 12, 9, 10, 11, 10, 10, 8, 8, 8, 14, 14, 14, 13, 10, 10, 9, 10, 9, 10) and expected total of 217.
- [ ] Compare IDs, order, retired redirects, prerequisites, runtime and status between the PDF and the compiled preview; record mismatches rather than normalizing them silently.
- [ ] Mark each of the existing 90 audit observations as satisfied by current evidence, still missing, obsolete, or requiring site implementation. Do not treat every `pending` entry as a curriculum defect without checking its linked card and source.
- [ ] Confirm the live app's current activity/runner limits and map each planned engine to existing capability or a separately estimated implementation need.

**Exit:** one ledger lists every scoped ID exactly once with current status, source file, activity kind, engine, prerequisite, runtime, existing review link, and a gap label.

### Task 2: Approve the common activity and engine contract

**Files:** `course-src/recipe_api.py`, `course-src/implementation_protocol.md`, and the activity ledger.

- [ ] Define for each card: objective, misconception, learner prompt, explanation/example sequence, timing of first learner-authored response, starter/assets, public criteria, published edges, runtime, compatibility, graduated hints, explained solution, transfer, mastery evidence, telemetry and next activity.
- [ ] Add explicit authoring fields for the mental model, worked example, common trap, why it matters, first response and its timing, interaction flow, and learner resources. The source API now names these as `explanation`, `first_response`, `first_response_timing`, `interaction`, and `resources`.
- [ ] Store the transfer challenge separately from its expected result. The learner-facing `transfer_prompt` must not expose the oracle kept in `transfer`.
- [ ] Add a review record to the authoring shape: linked skill/activity ID, recovery prompt, at least three plausible choices, correct answer, distinct right/wrong feedback, and the D+7/D+21 spaced-review policy. `recipe_api.py` now normalizes the card's primary skill and schedule into each record.
- [ ] Define input modes for PREDICT, TRACE, READ, COMPARE, PARSONS, FADED, MAKE, MODIFY, DEBUG, TEST, DOCS, UI, TYPE, INVESTIGATE and PROJECT. Every mode specifies the learner's actual authored action and an accessible non-drag alternative.
- [ ] Specify how progressively faded examples are selected from prior evidence, how a requested hint changes evidence, and how a new-domain transfer is scheduled after solution reveal.
- [ ] Define the reusable engine-to-stage matrix without promising unavailable runners.

**Exit:** schema examples validate for a reading/prediction card, code card, debugging/test card, UI card, type card, and project card; product-level decisions about unknown runner capabilities are explicit.

### Task 3: Author stages 00–06 (70 activities)

**Files:** only `course-src/recipes/00.py`–`06.py`; any shared schema change is owned by the integrator.

- [ ] Subagent A audits all 70 cards and authors only its range, preserving IDs and sequence.
- [ ] Replace any unexplained code-writing jump with the smallest sufficient worked example and a fade step; make transfer distinct from the starter.
- [ ] Include property-oriented boundaries for pure calculations/validation, clear `0`/empty/invalid distinctions, and truthful language/host/tool boundaries.
- [ ] Check that `READ`/`PREDICT` warmups teach rather than claim mastery and that every completion-bearing card captures a learner response.

**Exit:** 70 cards satisfy the common contract and support current or explicitly deferred runner modes.

### Task 4: Author stages 07–14 (89 activities)

**Files:** only `course-src/recipes/07.py`–`14.py`.

- [ ] Subagent B audits all 89 cards and authors only its range, preserving the PDF order and IDs.
- [ ] Strengthen tool selection, measurement, DOM safety/accessibility, HTTP response semantics, deterministic async races, debugging hypotheses, test quality, codebase investigation, documentation lookup, ESM and Git practice.
- [ ] Extend the same Kanban artifact from 11.08 through 13.14; include old/corrupt saves and regression evidence where published.
- [ ] Do not force `reduce`, a specific combinator, DOM mechanism, or module layout unless the card's stated competency is that exact mechanism.

**Exit:** 89 cards pass public/hidden contract review; HTTP/time/network fixtures are deterministic; runner gaps are recorded separately.

### Task 5: Author stages 15–20 (58 activities)

**Files:** only `course-src/recipes/15.py`–`20.py`.

- [ ] Subagent C audits all 58 cards and authors only its range, preserving the PDF order and IDs.
- [ ] Separate compile-time guarantees from runtime validation in every TypeScript card; include valid and invalid type cases where relevant.
- [ ] Keep advanced type transformations purposeful, explain compiler output, include maintainability/“when not to use” decisions, and avoid type gymnastics as a score target.
- [ ] Test iterators/streams with empty, consumed, infinite/take, slow-consumer, failure, and Unicode/byte cases as applicable; declare feature/runtime support.

**Exit:** 58 cards pass type/runtime distinction review and their transfer tasks do not reproduce the same answer with renamed variables.

### Task 6: Cross-stage editorial and pedagogical integration

**Files:** recipes 00–20, stage files, bridges, audit traceability, and generated preview after compilation.

- [ ] Integrator reviews all three agent reports and diffs; resolves contradictions across shared terms, prerequisites, runtime, hints, difficulty axes and project continuity.
- [ ] Confirm stage order, bridge-before-first-use, concept-graph acyclicity, no retired active IDs, no missing review links, no duplicated objective without a stated progression, and no future prerequisite.
- [ ] Confirm every learner-facing activity has a prompt, explanation/resource plan, response mode, visible acceptance, published boundary cases, feedback, help, transfer, review question, and completion evidence appropriate to its kind.
- [ ] Run adversarial editorial review: attempt valid alternate solutions, contradictory public/hidden behavior, ambiguous requirements, empty/zero/duplicate/special Unicode values, repeated actions, network/time ordering, corrupted storage and runtime mismatch.
- [ ] For code tasks with a meaningful behavioral oracle, execute public and hidden fixtures against the reference solution and at least one misconception-targeted mutant. For open-ended design, review against observable rubric criteria instead of inventing an exact output oracle.
- [ ] Run keyboard/focus/screen-reader checks on UI interactions; automated accessibility checks do not substitute for manual review.

**Exit:** second editor signs off the learner prompt, oracle, transfer, review prompt and accessibility behavior; all gaps are resolved or explicitly deferred.

### Task 7: Integrate and release the site in engine-sized slices

**Files:** current app and only the runner, review, progress, and accessibility modules found during Task 1 to own the required engine.

- [ ] Implement or extend only the engines required for the next release slice; do not launch all 217 cards while the active UI supports only early-stage formats.
- [ ] Connect card version, runtime, fixtures, hints, work files, review question and progress states end to end.
- [ ] Preserve a prediction and confidence before Run; keep draft code through reload; distinguish timeout/executor failure from incorrect work; schedule a review after eligible completion; schedule transfer after solution reveal.
- [ ] Verify isolated execution, network restrictions, output/resource limits, safe logs and reproducible fixtures before enabling code-running exercises.
- [ ] Release in dependency order: 00–06 foundations; 07–10 reasoning/objects; 11–14 browser, async, testing and Node/Git; 15–20 TypeScript and iterators. A slice is not published until its whole engine and its cards reach `READY`.

**Exit:** each released card is `READY` only after the recipe, executable files, tests, transfer, review, compatibility and second-editor approval all agree on the same version/hash.

## Validation Strategy

- Editorial/compiler: run the repository's actual `course-src/compile_content.py`, `course-src/build_graph.py`, and `course-src/build_coverage.py` workflows after changes; confirm exactly 254 total third-edition records and exactly 217 records in 00–20, unique IDs, resolved prerequisites, acyclic graph, no empty required contract field, valid review links, and stable retired redirects.
- Exercise behavior: run public and reserved cases against the reference solution; verify the targeted mutant fails for the intended reason; property-test pure logic when useful; verify alternative valid strategies are accepted.
- Browser flows: keyboard-only, reduced motion, focus after validation/submission, status announcements, responsive layout, safe user text, reload persistence, and review eligibility.
- Runtime flows: Node/browser/TypeScript versions match metadata; fake network/clock cases reproduce deterministically; CPU, memory, duration, output, filesystem and network limits are enforced before user code runs.
- Product: discover existing test/build/lint/typecheck commands from project configuration before using them. Follow the repository's `AGENTS.md` Python-test rule (`uv run python -m pytest ...`) if a pytest suite exists. Do not claim an unrun check passed. Build/deploy only after the corresponding site integration task is approved.

## BDD Acceptance Examples

```gherkin
Scenario: Preserve a prediction before running code
  Given a prediction activity with an editable answer and confidence control
  When the learner submits the prediction and then runs the program
  Then the original prediction remains attached to that attempt
  And the output is shown beside the predicted result

Scenario: A Parsons scaffold does not claim independent mastery
  Given the learner completes a reordered-block activity correctly
  When the activity's goal is independent code writing
  Then the learner receives a short independent transfer prompt before mastery is marked

Scenario: A hidden edge follows the published contract
  Given an activity publishes how empty values and duplicate input are handled
  When a reserved fixture uses those published boundaries
  Then the solution is evaluated by behavior
  And no hidden case adds an undisclosed implementation requirement

Scenario: Schedule active recall after eligible completion
  Given an activity is completed with its required learner-authored evidence
  When the learner returns to the review area
  Then its linked concept question is eligible on the configured schedule
  And correct and incorrect answers show explanatory feedback

Scenario: Keep tool failures out of learner scoring
  Given an isolated runner times out before returning a valid execution result
  When the attempt is evaluated
  Then it is recorded as a technical failure
  And it is not counted as an incorrect learner answer
```

## Research Basis

- A classroom study with 237 students found Faded Parsons useful for pattern acquisition and comparable transfer to later code-writing practice; use it as one step in a sequence, not a replacement for independent writing: [Improving Instruction of Programming Patterns with Faded Parsons Problems (CHI 2021)](https://doi.org/10.1145/3411764.3445228).
- A study of 89 undergraduate students found scaffolding improved in-practice outcomes for learners with low CS self-efficacy, while post-test differences were not significant. This supports optional scaffolds followed by unassisted transfer, not permanent reliance on them: [Understanding the Effects of Using Parsons Problems to Scaffold Code Writing (Koli Calling 2023)](https://doi.org/10.1145/3631802.3631832).
- Reddit discussions offer anecdotal learner reports favoring hints over ready-made solutions, immediate feedback, and small projects with clear acceptance criteria. They inform friction/design questions, not causal claims: [hints and feedback](https://www.reddit.com/r/learnjavascript/comments/1tm4ti7/need_guidance_on_how_to_actually_learn_javascript/), [small projects and acceptance criteria](https://www.reddit.com/r/learnjavascript/comments/1ojpfsx/learning_javascript/), [balancing exercises with projects](https://www.reddit.com/r/learnjavascript/comments/ttm9s3/exercises_to_learn_javascript/).

## Audit Findings and Authoring Targets

The three subagent audits reconciled the 217 active IDs against `resolved_preview.json` and the PDF. Stage totals are **70** (00–06), **89** (07–14), and **58** (15–20), for **217** in scope. One audit initially counted 15.05 as active; the preview confirms it is retired and redirects to 16.09, so it is excluded. The current full preview has 254 records across all course stages.

The smaller `course-src/exercises/*.json` files are legacy scaffolds and must not be used to restore or overwrite current activities. They omit current additions, contain blank placeholders, and in some cases misstate the PDF's activity kind. In particular:

- Stages 00–06: missing `02.10`–`02.12`, `04.10`, `05.11`, and `06.10`; `05.json` has an ID-less blank `flat()` entry; legacy `00.07` is mislabeled as implementation although the PDF specifies prediction.
- Stages 07–14: `07.10` is blank; legacy exports omit `11.09`–`11.14`, `12.10`–`12.14`, `13.09`–`13.14`, and `14.09`–`14.13`.
- Stages 15–20: legacy files contain only eight entries apiece and lack the current metadata/content. Do not recreate retired `15.05`; retain its redirect to `16.09`.

Targeted revisions from the card audits:

- **00–06:** preserve the early path from prediction/trace to the first edit at `00.04` and the first independently authored expression at `01.07`; make `00.07` prediction-only. Improve `01.06` into separate single-fault diagnoses; stage `02.01` by operator family; publish blank/whitespace input behavior in `02.04`; use `03.04`–`03.05` for fading then authored boundary cases before loops; make floating-point scope explicit in `04.07`; define empty-list and delimiter cases in `05.07`–`05.08`; distinguish JSON parse errors from shape validation in `06.06`; make the persistent project sequence explicit from `00.09` through `06.09`. Keep `06.09`'s current PDF contract unless a separately documented course decision changes its invalid-save fallback.
- **07–14:** define one result shape for the grouping API comparison in `07.02`; publish runtime/fallback behavior for `07.05`, `12.09`, `12.13`, and `14.07`; make reproduction and regression evidence explicit in `07.06`, `08.05`, and `13.05`; judge complexity using behavior and asymptotic reasoning, never one timing value (`08.07`). Deliver actual repository/file-tree fixtures for project cards (`10.06`, `11.08`, `11.10`, `14.09`). Inject deterministic HTTP/time fixtures and block free network access (`12.06`, `12.08`, `13.09`). Preserve the Kanban history; since `11.13` already migrates V1→V2, make `13.14` the V2→V3 priority change.
- **15–20:** add a concrete class-private/protected-member comparison to `15.06`; fix the compiler baseline and represent prerequisites for generics/`keyof`/utility types in stage 18–19; keep type/interface and recursive types in honest scope (teach or mark for deferral). Correct `20.01` so the iterator protocol's `{done:true, value}` can carry a return value even though `for...of` does not yield it. Distinguish language edition from runtime support, pin TypeScript/Node baselines, and treat `Iterator.concat` as unavailable in the Node 24 learner environment unless feature-detected or deferred.

The audit exemplars are design demonstrations, not claims that their runner files already exist: `06.09` models save migration and validation; `13.14` models a localized Kanban V2→V3 migration with tests before code changes; `20.08` models lazy iterator composition using pull counts and cleanup. They supply concrete prompt, explanation, timing of the first authored response, resources, fixtures, hints, solution, transfer, and mastery evidence for the range owners to adapt.

## Applied Authoring Pass — Complete

The pass revised the existing active recipes across stages 00–20; it did not create 217 new exercises. The catalogue contains 217 active cards across 21 numbered stages. Retired `15.05` remains absent and redirects to `16.09`.

Each active card now has a learner-facing prompt and contract, four differentiated explanation parts, an explicitly timed first written response, an interaction, concrete resources, spaced recall at D+7 and D+21, and a separate transfer task with an expected result. The compiler serializes the first-response checkpoint before the explanatory material. Worked examples use parallel cases; public and hidden cases are checked against the published boundaries. Where QA found a missing input, ambiguous rule, answer leak, weak transfer, or mismatch between prompt and expected result, the owning range revised that card and received a second-editor review.

- **00–06:** added visible inputs and acceptance criteria, independent prediction and diagnosis before execution, separated worked examples from first responses, aligned transfer prompts and expected results, and added official references throughout. `06.09` retains the PDF's invalid-save fallback and teaches JSON persistence separately from `structuredClone` for local copies.
- **07–10:** published previously hidden edge behavior, completed transfer expectations and tie-breaking rules, translated the remaining examples into Portuguese, and replaced placeholder resources with official references.
- **11–14:** separated conceptual explanations from hints and solutions, added official references to all 55 cards, changed repeated transfers to new domains, and published persistence, time-boundary, and file-write contracts.
- **15–20:** removed remaining pre-answer examples, aligned transfer oracles and domains, corrected TypeScript prerequisite/runtime contracts, and kept `Iterator.concat` distinct from APIs available in the learner's Node baseline.
- **Shared contract:** retained `ts.keyof_indexed_access` after `ts.generics`, revised stage 18 prerequisites, and updated audit requirement 80 to describe Kanban V1→V2 followed by V2→V3.

## Final Validation

- `uv run python course-src/compile_content.py` — **passed**, 254 records with `contract_ready` status.
- `uv run python course-src/build_graph.py` — **passed**, 70 concepts, 254 activities, 393 edges, acyclic.
- `uv run python course-src/build_coverage.py` — **passed**, all 90 audit requirements mapped (20 P0; 55 requirements map to new activities).
- The scoped range contains exactly 217 active cards; all are `contract_ready`; retired `15.05` is absent.
- Static parse/import/shape checks and independent editorial reviews passed for the revised ranges. No behavioral exercise tests or browser/runner tests were run.

`contract_ready` confirms that the authored content meets the compiler's editorial schema; it does not mean the site already implements every runner, starter asset, interaction, or review queue. Those remain site-integration work. The `06.09` invalid-save behavior remains the PDF-preserving course decision.

## Handoff

The requested authoring pass for stages 00–20 is complete and compiled. The next separate implementation milestone is wiring the authored interactions, runners, resources/assets, first-response gate, and D+7/D+21 review queue into the site, then validating those flows in the browser.
