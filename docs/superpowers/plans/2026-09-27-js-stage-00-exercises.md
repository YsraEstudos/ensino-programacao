# DevPath JavaScript Stage 00 Exercises Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Keep each task within its listed files.

**Goal:** Add the first five interactive JavaScript exercises (00.01–00.05) to the local DevPath preview and authenticated DevPath site.

**Architecture:** Add a small, non-evaluating interpreter for the syntax taught in stage 00 and a dedicated UI module for the five lessons and exercises. Wire the modules into the existing hash router in both site variants, using local storage in the preview and the existing D1 progress API in the authenticated version.

**Tech Stack:** Existing HTML, CSS, vanilla JavaScript, Next.js static public assets, TypeScript API route, and D1 JSON progress record. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-27-js-stage-00-design.md`

## Global Constraints

- Keep stable activity IDs `00.01` through `00.05` and write all learner-facing copy in Brazilian Portuguese.
- Teach each concept before the task; require typed code in every activity, including the environment-classification task 00.05.
- The interpreter accepts only separate `console.log(...)` calls with string/number literals and addition of numeric literals; it never executes arbitrary code.
- Do not claim Node.js 24 compatibility or a general JavaScript runtime.
- Add no dependencies, database tables, migrations, external publishing steps, or edits to `devpath-publish`.
- Preserve the three existing Web Foundations lessons and their progress behavior.
- Limit each saved code draft to 600 characters and do not send learner code to telemetry.
- Do not add or run automated tests unless the user asks; use source checks, build, and manual preview inspection only.
- The workspace root has no Git repository, so do not add commit steps or initialize Git.

## Review Focus

1. A comma inside a quoted string (for example, `"Olá, Ana"`) must not be mistaken for an argument separator. Inspect in the interpreter task with the 00.03 data.
2. `0` and `""` must remain distinct values in parsed output and in the 00.04 UI. Inspect with the published edge examples.
3. Unsupported syntax and malformed lines must return a line-specific teaching message without marking an exercise conceptually wrong. Inspect in interpreter and UI tasks.
4. Reordering 00.03 blocks must exclude the distractor and work with keyboard controls as well as pointer controls. Inspect in the UI and local preview tasks.
5. Drafts and completion for all five IDs must survive reload in both storage adapters, while invalid IDs/drafts are rejected by the authenticated API. Inspect in the persistence task and both previews.

---

### Task 1: Stage 00 subset interpreter

**Files:**
- Create `js-stage00-runner.js`

**Interfaces:**
- Produce `window.DevPathStage00Runner.interpret(source)` for later UI use.
- Return either `{ ok: true, lines: [{ sourceLine, values }] }` or `{ ok: false, error: { line, kind, message } }`. `values` preserves each parsed string/number argument rather than only flattening it to text.

- [x] **Step 1: Define the grammar and result shapes in JSDoc.** Accept one `console.log(...)` call per line, optional trailing semicolon, quoted single/double-quoted strings, finite numeric literals, and `number + number` expressions. Ignore commas inside quoted strings when splitting arguments. Reject variables, comments, other operators, control flow, member access beyond `console.log`, and extra statements.
- [x] **Step 2: Implement a scanner/parser without `eval`, `Function`, or dynamic script creation.** Cap source at 600 characters and 20 lines; report the first malformed or unsupported line with a Portuguese message and `kind` set to `syntax` or `not_taught`.
- [x] **Step 3: Produce typed output records for accepted lines.** Preserve an empty string as a value, compute only numeric literal addition, and keep the source line number for trace animation.
- [x] **Step 4: Mirror the file at `devpath-site/public/js-stage00-runner.js`.** Keep the two copies identical so both site variants use the same grammar.
- [x] **Step 5: Run `node --check js-stage00-runner.js`.** Expected: exit code 0. Review Focus 1 and 2 are later inspected through the UI.

### Task 2: Exercise content and reusable stage UI

**Files:**
- Create `js-stage00-ui.js`

**Interfaces:**
- Consume `window.DevPathStage00Runner.interpret(source)` from Task 1.
- Produce `window.DevPathStage00UI.renderOverview(progress)`, `renderExercise(id, progress)`, `handleClick(event, context)`, `handleInput(event, context)`, and `flushDraft(context)`.
- `context` contains `{ progress, saveProgress, render }`; `progress` is the existing progress object extended with `exerciseDrafts: Record<string, string>`.

- [x] **Step 1: Add five activity records for IDs 00.01–00.05.** Each record includes learning objective, explanation, worked example, microcheck and feedback, practice prompt, public expected results and edge cases, misconception, three graduated hints, and a transfer prompt. Use PDF pages 19–23 as the activity reference and the user's approved 00.05 code-writing addition.
- [x] **Step 2: Implement `renderOverview(progress)` and `renderExercise(id, progress)`.** Render the five activities in order; show the learn/example/microcheck sections before the main editor; restore that activity's saved draft; escape all data inserted into HTML.
- [x] **Step 3: Implement delegated click/input handlers.** Support prediction, Run, hints, transfer, Parsons block reordering, and keyboard move controls. Update the in-memory draft on every input, debounce persistence by 500 ms, and flush pending saves on Run, in-app navigation, and route render. Increment `attempts[id]` on each explicit Run; an unsupported syntax result must not set `answers[id] = false`.
- [x] **Step 4: Keep completion evidence separate from mastery.** Mark `answers[id]` successful and add the ID to `completed` only after the main public task succeeds; leave the transfer prompt available as a separate follow-up.
- [x] **Step 5: Mirror the file at `devpath-site/public/js-stage00-ui.js` and run `node --check js-stage00-ui.js`.** Expected: exit code 0. Review Focus 3 and 4 are checked in the preview task.

### Task 3: Integrate the local preview

**Files:**
- Modify `index.html`
- Modify `app.js`
- Modify `styles.css`
- Use `js-stage00-runner.js` and `js-stage00-ui.js` from Tasks 1–2

**Interfaces:**
- Route `#/javascript` renders the stage overview; `#/javascript/00.01` through `#/javascript/00.05` render the matching activity.
- `app.js` passes its existing `progress`, `saveProgress`, and `render` functions to `DevPathStage00UI`.

- [x] **Step 1: Load the runner and UI scripts before `app.js` in `index.html`.** Preserve deferred script order.
- [x] **Step 2: Add the stage route and catalog card.** Keep the existing lesson routes and catalog filters intact; use the exact IDs in activity links.
- [x] **Step 3: Add `exerciseDrafts: {}` to `blankProgress()` and use the existing `devpath:progress:v1` storage key.** Merging old saved data must keep existing Web Foundations completion and review records.
- [x] **Step 4: Forward stage clicks and input events from the existing `#view` delegation to `DevPathStage00UI`.** Save changed attempts and drafts through the existing local `saveProgress()` path.
- [x] **Step 5: Add responsive stage styles.** Animate line-by-line output, changed-line comparison, and block movement; include `prefers-reduced-motion`, visible focus, and live feedback styling.
- [x] **Step 6: Run `node --check app.js` and inspect the root preview in a browser.** Confirm both the new stage routes and all three existing lessons remain reachable.

### Task 4: Integrate the authenticated site and D1 progress

**Files:**
- Modify `devpath-site/public/devpath.html`
- Modify `devpath-site/public/app.js`
- Modify `devpath-site/public/styles.css`
- Modify `devpath-site/app/api/progress/route.ts`
- Copy the Task 1–2 modules to `devpath-site/public/`

**Interfaces:**
- Use the same routes and `DevPathStage00UI` callbacks as Task 3; only the existing progress adapter differs.
- Accept activity IDs `00.01`–`00.05` in the API allowlist and sanitize `exerciseDrafts` to those IDs and strings of at most 600 characters.

- [x] **Step 1: Load both stage modules before `/app.js` in `public/devpath.html`.** Keep the authenticated shell and iframe intact.
- [x] **Step 2: Wire the same stage routes and catalog entry in `public/app.js`.** Add the empty `exerciseDrafts` shape while preserving the serialized D1 save queue.
- [x] **Step 3: Extend the existing progress sanitizer.** Add the five exact IDs to its allowlist; accept only drafts for those IDs with length at most 600; retain the 12 KB payload cap and existing three lesson behavior. Do not add a D1 table or migration.
- [x] **Step 4: Apply the matching stage CSS in `public/styles.css`.** Keep it byte-equivalent to the local preview's stage rules.
- [x] **Step 5: Run `node --check public/app.js` from `devpath-site` and inspect the existing route/API code.** Expected: exit code 0 and invalid IDs/drafts cannot enter the saved progress object.

### Task 5: Build and inspect the integrated experience

**Files:**
- No new files; only corrections within files listed above.

**Interfaces:**
- Verify the public UI against the spec's acceptance criteria and the five routes.

- [x] **Step 1: Run `npm run build` from `devpath-site`.** Expected: the existing Next/Vite build completes without type or bundling errors.
- [x] **Step 2: Open the local preview and inspect each activity.** Confirm concepts/examples precede the main task, code is editable on all five, the expected outputs render, and errors distinguish unsupported syntax from an incorrect answer.
- [x] **Step 3: Inspect the 00.04 empty-string/zero case and the 00.03 pointer/keyboard reordering.** Confirm the blank value remains visibly represented, the distractor stays unused, and reduced-motion preference removes nonessential animation.
- [ ] **Step 4: Inspect persistence after reload in the local preview and authenticated Site preview.** Confirm drafts and completion survive, only the authenticated API stores authenticated-site progress, and no code is inserted as HTML or sent to telemetry.
- [x] **Step 5: Revisit the original Web Foundations routes in both previews.** Confirm their navigation, lesson content, and prior progress still work.

## Plan Self-Review

- **Spec coverage:** Tasks 1–2 cover the restricted runner and content; Tasks 3–4 cover local/authenticated integration, persistence, and accessibility; Task 5 covers visual and behavioral acceptance. The PDF itself is not modified, and the 00.05 adaptation is explicit.
- **Step scan:** Each task has a named deliverable, exact files, interfaces, and bounded verification commands or preview inspections. No root Git commit is listed because the root checkout is not a Git repository.
- **Type consistency:** The UI consumes `DevPathStage00Runner.interpret(source)` and receives `{ progress, saveProgress, render }`; both app variants use the same routes and component interface.
- **Review Focus:** Each of the five input/failure classes is assigned to a parser, UI, API, or preview inspection step.
- **Proportion:** Five tasks map directly to the new interpreter, one UI module, two existing app variants, and final integration; the plan does not include future stages or a general runtime.

## Execution status

- Tasks 1–5 implementation and planned checks completed except the live, account-backed D1 persistence check in Task 5, Step 4. The authenticated UI was inspected through its static shell, but that preview has no API route or signed-in session; no account progress was written.
- Local draft and completion persistence were confirmed after reload. The build and JavaScript syntax checks were run; no automated tests were added or run per the approved plan.
- Root has no Git repository, so there is no commit range or commit-based review artifact. The final pass was a self-review of the implementation and the manual browser observations.