(function (global) {
  "use strict";

  // Pure review logic: eligibility, seeded selection, attempt reconciliation, grading and recording.
  // Clock (`now`), randomness (`random`) and executors are always injected; nothing here touches the DOM.
  const FORMATS = Object.freeze(["choice-predict", "predict-code", "short-fix", "mini-impl"]);
  const EVALUATOR = Object.freeze({ "choice-predict": "choice", "predict-code": "output-match", "short-fix": "behavior", "mini-impl": "behavior" });
  const ENVIRONMENTS = new Set(["javascript", "dom", "typescript", "node-local", "rubric"]);
  // Only these environments can run learner code in the browser, so only they may offer short-fix and mini-impl.
  const BROWSER_EXECUTABLE = new Set(["javascript", "dom"]);
  const VARIANT_ID = /^var\.(?:D|\d{2})\.\d{2}\.[a-z0-9][a-z0-9-]{0,60}$/;
  const ACTIVITY_ID = /^(?:D|\d{2})\.\d{2}$/;
  const BEHAVIOR_TEST_PATH = "__review.test.js";
  const DRAFT_LIMIT = 12000;
  const HISTORY_LIMIT = 10;
  const LIMIT_NOTES = Object.freeze({
    none: "Ainda não há variações publicadas para esta revisão; usamos a pergunta original.",
    ineligible: "Nenhuma variação desta revisão é elegível neste ambiente; usamos a pergunta original de múltipla escolha."
  });

  // Executors describe what this browser can run: { snippet: boolean, behavior: Set<environment> }.
  function executorsOf(value) {
    return { snippet: value?.snippet === true, behavior: value?.behavior instanceof Set ? value.behavior : new Set() };
  }

  // Published variants list their files as [{ path, content }]; tests and older fixtures use a path-to-content map.
  function fileMap(files) {
    if (Array.isArray(files)) {
      return Object.fromEntries(files.filter(file => file && typeof file.path === "string" && typeof file.content === "string").map(file => [file.path, file.content]));
    }
    return files && typeof files === "object" ? files : {};
  }

  // The learner's starting code for the entry file (short-fix and mini-impl).
  function starterOf(variant) {
    const content = fileMap(variant?.starterFiles)[variant?.entryPath];
    return typeof content === "string" ? content : "";
  }

  function wellFormed(variant) {
    if (!variant || typeof variant !== "object" || typeof variant.variantId !== "string" || !VARIANT_ID.test(variant.variantId)) return false;
    if (!FORMATS.includes(variant.format) || variant.evaluator !== EVALUATOR[variant.format] || !ENVIRONMENTS.has(variant.environment)) return false;
    if (!ACTIVITY_ID.test(String(variant.sourceActivityId)) || !Number.isInteger(variant.contentVersion) || variant.contentVersion < 1) return false;
    if (typeof variant.prompt !== "string" || !variant.prompt.trim()) return false;
    if (!Array.isArray(variant.prerequisites) || variant.prerequisites.some(id => !ACTIVITY_ID.test(String(id)))) return false;
    if (variant.format === "choice-predict") {
      return Array.isArray(variant.choices) && variant.choices.length >= 2 && variant.choices.every(choice => typeof choice === "string")
        && Number.isInteger(variant.answer) && variant.answer >= 0 && variant.answer < variant.choices.length
        && Boolean(variant.feedback && typeof variant.feedback === "object");
    }
    if (variant.format === "predict-code") return typeof variant.code === "string" && variant.code.trim().length > 0;
    return typeof variant.entryPath === "string" && typeof variant.tests === "string" && variant.tests.trim().length > 0
      && typeof fileMap(variant.starterFiles)[variant.entryPath] === "string";
  }

  // The eligibility matrix. Choice needs nothing to run; predict-code needs the snippet runner;
  // short-fix and mini-impl need a browser-executable environment and its behavior executor.
  function formatAllowed(variant, executors) {
    if (!wellFormed(variant)) return false;
    if (variant.format === "choice-predict") return true;
    if (variant.format === "predict-code") return executors.snippet;
    return BROWSER_EXECUTABLE.has(variant.environment) && executors.behavior.has(variant.environment);
  }

  // Studied prerequisites are required. Optional activities (source or prerequisite) need the learner's opt-in.
  function isEligible(variant, context) {
    const { studied, optional, optIn, executors } = context;
    if (!formatAllowed(variant, executors)) return false;
    if (!studied.has(variant.sourceActivityId)) return false;
    if (!variant.prerequisites.every(id => studied.has(id))) return false;
    const touchesOptional = optional.has(variant.sourceActivityId) || variant.prerequisites.some(id => optional.has(id));
    return !touchesOptional || optIn === true;
  }

  function eligibleVariants(variants, activityId, context) {
    return (Array.isArray(variants) ? variants : [])
      .filter(variant => variant && variant.sourceActivityId === activityId && isEligible(variant, context))
      .sort((a, b) => (a.variantId < b.variantId ? -1 : a.variantId > b.variantId ? 1 : 0));
  }

  // mulberry32: a small seeded generator, so selection can be replayed in tests and after reload.
  function seededRandom(seed) {
    let state = Number(seed) >>> 0;
    return function random() {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Chooses one variant for an activity. Preference tiers: a different variant and format than the last review,
  // then a different variant, then any eligible variant. The seeded random picks inside the first non-empty tier.
  function chooseVariant(activityId, context) {
    const eligible = eligibleVariants(context.variants, activityId, context);
    if (!eligible.length) return null;
    const last = context.lastByActivity?.[activityId] || {};
    const tiers = [
      eligible.filter(variant => variant.variantId !== last.variantId && variant.format !== last.format),
      eligible.filter(variant => variant.variantId !== last.variantId),
      eligible
    ];
    const tier = tiers.find(candidates => candidates.length) || eligible;
    const random = typeof context.random === "function" ? context.random : Math.random;
    const index = Math.min(tier.length - 1, Math.floor(random() * tier.length));
    return tier[index];
  }

  // candidates: activity ids in priority order (due reviews first, then the practice pick).
  // Returns a variant selection for the first candidate that has one, or a legacy fallback with a limitNote.
  function chooseReview({ candidates, variants, studied, optional, optIn, executors, lastByActivity, random }) {
    const context = {
      variants: Array.isArray(variants) ? variants : [],
      studied: studied instanceof Set ? studied : new Set(studied || []),
      optional: optional instanceof Set ? optional : new Set(optional || []),
      optIn: optIn === true,
      executors: executorsOf(executors),
      lastByActivity: lastByActivity || {},
      random
    };
    const ids = (Array.isArray(candidates) ? candidates : []).filter(id => ACTIVITY_ID.test(String(id)));
    for (const activityId of ids) {
      const variant = chooseVariant(activityId, context);
      if (variant) {
        return { kind: "variant", activityId, variant, format: variant.format, counted: !context.optional.has(activityId), limitNote: null };
      }
    }
    const hasAny = context.variants.some(variant => wellFormed(variant));
    return {
      kind: "legacy",
      activityId: ids[0] || null,
      variant: null,
      format: "choice-predict",
      counted: ids[0] ? !context.optional.has(ids[0]) : true,
      limitNote: ids.length ? (hasAny ? LIMIT_NOTES.ineligible : LIMIT_NOTES.none) : null
    };
  }

  // Keeps at most one pending attempt per activity. A pending attempt whose content version changed, or whose variant is
  // no longer eligible, is archived under "<variantId>@v<version>" so it stays in history. Returns the resumable variant id.
  function reconcileAttempts({ attempts, variants, activityId, studied, optional, optIn, executors }) {
    const context = {
      studied: studied instanceof Set ? studied : new Set(studied || []),
      optional: optional instanceof Set ? optional : new Set(optional || []),
      optIn: optIn === true,
      executors: executorsOf(executors)
    };
    const byId = new Map((Array.isArray(variants) ? variants : []).filter(wellFormed).map(variant => [variant.variantId, variant]));
    const next = { ...(attempts || {}) };
    let resume = null;
    for (const [key, attempt] of Object.entries(next)) {
      if (key.includes("@v") || isKataAttemptKey(key) || !attempt || attempt.activityId !== activityId || attempt.status !== "pending") continue;
      const variant = byId.get(key);
      const stale = !variant || variant.contentVersion !== attempt.contentVersion || !isEligible(variant, { ...context, variants: [] });
      if (stale) {
        delete next[key];
        next[`${key}@v${attempt.contentVersion}`] = attempt;
      } else if (!resume) {
        resume = key;
      }
    }
    return { attempts: next, resumeVariantId: resume };
  }

  // Kata attempts share the variant bank but live under their own keys ("var.<activity>.kata-<slug>"), so a kata never
  // resumes, archives or moves a review attempt. They are sanitized with the rest of reviewAttempts.
  const KATA_KEY_PREFIX = "kata-";
  const KATA_KEY = /^var\.(?:D|\d{2})\.\d{2}\.kata-/;
  function kataAttemptKey(variant) {
    const head = `var.${variant.sourceActivityId}.`;
    return `${head}${KATA_KEY_PREFIX}${variant.variantId.slice(head.length)}`;
  }
  function isKataAttemptKey(key) { return KATA_KEY.test(String(key)); }

  // Starts (or restarts) the kata attempt for a variant and returns the whole attempts map; other keys are kept as they are.
  function startKataAttempt(attempts, variant, now) {
    return {
      ...attempts,
      [kataAttemptKey(variant)]: {
        activityId: variant.sourceActivityId, contentVersion: variant.contentVersion, format: variant.format,
        draft: "", status: "pending", usedHelp: false, startedAt: now, finishedAt: 0
      }
    };
  }

  function startAttempt(attempts, variant, now) {
    return {
      ...attempts,
      [variant.variantId]: {
        activityId: variant.sourceActivityId, contentVersion: variant.contentVersion, format: variant.format,
        draft: "", status: "pending", usedHelp: false, startedAt: now, finishedAt: 0
      }
    };
  }

  function clampDraft(draft, limit = DRAFT_LIMIT) {
    return typeof draft === "string" ? draft.slice(0, limit) : "";
  }

  function gradeChoice(variant, draft) {
    const index = Number(draft);
    if (draft === "" || !Number.isInteger(index) || index < 0 || index >= variant.choices.length) return { result: null, feedback: "Escolha uma resposta antes de conferir." };
    const correct = index === variant.answer;
    const byChoice = variant.feedback?.byChoice || {};
    const feedback = correct
      ? variant.feedback?.correct || "Resposta correta."
      : byChoice[String(index)] || "Ainda não é essa. Releia o trecho e tente de novo.";
    return { result: correct ? "passed" : "failed", feedback };
  }

  // Compares normalized text (line endings, trailing spaces, outer blank lines), never code.
  function normalizeOutput(value) {
    return String(value ?? "").replace(/\r\n?/g, "\n").split("\n").map(line => line.trimEnd()).join("\n").trim();
  }

  // runSnippet(code) resolves to { kind, text }; the reference is the executed output, not a stored string.
  async function gradePredictCode(variant, draft, runSnippet) {
    if (!String(draft).trim()) return { result: null, feedback: "Escreva a saída prevista antes de conferir." };
    const reference = await runSnippet(variant.code);
    if (!reference || reference.kind !== "result") return { result: null, feedback: "Não foi possível executar a referência desta pergunta.", unavailable: true };
    const correct = normalizeOutput(draft) === normalizeOutput(reference.text);
    const feedback = correct ? variant.feedback?.correct || "A saída confere." : variant.feedback?.incorrect || "A saída não confere. Rode o trecho linha a linha e compare.";
    return { result: correct ? "passed" : "failed", feedback };
  }

  // runBehavior({ variant, files }) resolves to a runner outcome { kind, text }, the same one DevPathAssessment.run returns.
  async function gradeBehavior(variant, draft, runBehavior) {
    if (!String(draft).trim()) return { result: null, feedback: "Escreva sua solução antes de conferir." };
    const files = Object.entries(fileMap(variant.starterFiles)).map(([path, content]) => ({ path, content: path === variant.entryPath ? draft : content }));
    const outcome = await runBehavior({ variant, files });
    if (outcome?.kind === "passed") return { result: "passed", feedback: outcome.text || "Os testes passaram." };
    if (["failed", "error", "type-error", "timeout"].includes(outcome?.kind)) {
      return { result: "failed", feedback: outcome.text || "Os testes não passaram. Corrija a solução e tente de novo." };
    }
    return { result: null, feedback: outcome?.text || "A execução não está disponível agora.", unavailable: true };
  }

  async function grade(variant, draft, runners) {
    if (variant.format === "choice-predict") return gradeChoice(variant, draft);
    if (variant.format === "predict-code") return gradePredictCode(variant, draft, runners.runSnippet);
    return gradeBehavior(variant, draft, runners.runBehavior);
  }

  // Records a graded check. Only the first check of an attempt moves the schedule and history; later retries after
  // feedback update the attempt's draft and status only. Nothing here writes learning evidence or "demonstrated".
  function recordCheck({ schedule, attempt, variant, draft, result, now, scheduled, scheduler }) {
    const reviewSchedule = scheduler || global.DevPathReviewSchedule;
    const passed = result === "passed";
    const firstCheck = !attempt.finishedAt;
    const nextAttempt = {
      ...attempt,
      draft: clampDraft(draft),
      status: result,
      finishedAt: firstCheck ? now : attempt.finishedAt
    };
    if (!firstCheck || !scheduled) return { attempt: nextAttempt, schedule: schedule || null, firstCheck };
    const entry = reviewSchedule.next(schedule, passed, now);
    const at = new Date(now).toISOString();
    const history = [...(Array.isArray(schedule.history) ? schedule.history : []), { variantId: variant.variantId, format: variant.format, result, at }].slice(-HISTORY_LIMIT);
    return {
      attempt: nextAttempt,
      schedule: { ...entry, lastVariantId: variant.variantId, lastFormat: variant.format, history },
      firstCheck
    };
  }

  // Latest graded review per activity for the alternation rule: the schedule's record when present, otherwise the
  // most recently finished attempt (practice reviews do not move schedules, so they are only visible in attempts).
  function lastByActivity(schedules, attempts) {
    const last = {};
    for (const [key, attempt] of Object.entries(attempts || {})) {
      if (key.includes("@v") || isKataAttemptKey(key) || !attempt || attempt.status === "pending") continue;
      const at = Number(attempt.finishedAt) || 0;
      if (!last[attempt.activityId] || at > last[attempt.activityId].at) last[attempt.activityId] = { at, variantId: key, format: attempt.format };
    }
    const result = {};
    for (const [id, value] of Object.entries(last)) result[id] = { variantId: value.variantId, format: value.format };
    for (const [id, entry] of Object.entries(schedules || {})) {
      if (entry?.lastVariantId) result[id] = { variantId: entry.lastVariantId, format: entry.lastFormat };
    }
    return result;
  }

  // The request DevPathAssessment.run receives for a short-fix or mini-impl draft. The variant's inline tests are the
  // behavior file, placed beside the learner's files so that `import ... from './main.js'` resolves.
  function behaviorRequest(variant, files) {
    return {
      item: { id: variant.variantId, contentVersion: variant.contentVersion },
      assessment: {
        environment: variant.environment, checks: ["behavior"], entryPath: variant.entryPath,
        behaviorTestPath: BEHAVIOR_TEST_PATH, tests: variant.tests, version: variant.contentVersion, timeoutMs: 3000, assertionCases: []
      },
      files,
      fingerprint: `review:${variant.variantId}@${variant.contentVersion}`
    };
  }

  global.DevPathReviewSelection = Object.freeze({
    FORMATS, EVALUATOR, LIMIT_NOTES, DRAFT_LIMIT, HISTORY_LIMIT, BEHAVIOR_TEST_PATH,
    formatAllowed, isEligible, eligibleVariants, chooseReview, reconcileAttempts, startAttempt,
    kataAttemptKey, isKataAttemptKey, startKataAttempt,
    gradeChoice, gradePredictCode, gradeBehavior, grade, normalizeOutput, recordCheck, clampDraft,
    lastByActivity, seededRandom, wellFormed, behaviorRequest, fileMap, starterOf
  });
})(globalThis);
