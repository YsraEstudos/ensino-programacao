# Generated Curriculum Artifacts Implementation Plan

> Registro histórico. Os caminhos, comandos e distribuições abaixo descrevem a estrutura da época; não devem orientar a manutenção atual. Consulte [a organização atual](../organizacao-projeto.md) e execute `npm.cmd run build:curriculum` dentro de `devpath-publish/`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep reproducible curriculum intermediates out of version control while ensuring builds, tests, audits, and PDF generation recreate and consume them.

**Architecture:** Treat recipes, stage text, editorial contracts, overrides, and audit requirements as inputs. Generate `resolved_preview.json`, `concept_graph.json`, and `audit_coverage.json` beneath `course-src/.generated/`; wire all consumers to that directory and make curriculum generation a prerequisite of build and test workflows. Ignore and untrack generated outputs, then remove the local Python and TypeScript caches approved for cleanup.

**Tech Stack:** Node.js ESM, Python standard library, npm scripts, Node test runner.

**Spec:** User-approved cleanup plan from this conversation: generated curriculum JSON must no longer be versioned, generation must precede consumers, local `__pycache__` and `tsconfig.tsbuildinfo` may be removed, normal ignored build output directories remain intact.

## Global Constraints

- Preserve the 254-activity public curriculum and current generated assets.
- Keep user-authored editorial inputs and `audit_requirements.json` versioned.
- Never delete local build output directories as part of this change.
- Regenerate intermediates deterministically before every consumer that needs them.

## Review Focus

- A clean checkout can build without checked-in generated curriculum JSON.
- Direct validators, Stage 02 verification, audit coverage, and PDF generation resolve the same generated directory.
- Re-running generation does not leave source-tree diffs or alter the public catalog unexpectedly.

---

### Task 1: Generate and consume ignored curriculum intermediates

**Files:**
- Create: `scripts/build-curriculum-data.mjs`
- Modify: `course-src/compile_content.py`, `course-src/build_graph.py`, `course-src/build_coverage.py`, `course-src/render_pdf.py`, `course-src/build-public-curriculum.mjs`, `course-src/verify-stage02.mjs`, `scripts/validate-curriculum-source.mjs`, `package.json`, `.gitignore`
- Test: `scripts/test-project-layout.mjs`

- [ ] Add a failing layout/generation test proving outputs live under `course-src/.generated` and no source-root copies are required.
- [ ] Add a deterministic orchestrator that runs compile, graph generation, public artifact generation, then validations.
- [ ] Update all consumers and npm build/test scripts to use/generated this directory.
- [ ] Verify the test turns green, then run curriculum validation, stage tests, and production build.
- [ ] Untrack generated JSON while retaining ignored local outputs.

### Task 2: Remove approved local caches

**Files:**
- Delete local-only: `course-src/__pycache__/`, `tsconfig.tsbuildinfo`

- [ ] Remove only these cache paths after generation and verification are complete.
- [ ] Confirm they remain ignored and the working tree contains no generated intermediates.
