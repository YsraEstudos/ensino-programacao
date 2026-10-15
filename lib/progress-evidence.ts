import { limits } from "./progress-contract.json";
import type { ExerciseEvidence, ReviewAttempt, ReviewFormat, ReviewHistoryEntry, ReviewSchedule } from "./progress-model";
import { boundedInteger, record, text, validTimestamp } from "./progress-values";

function testCounts(value: unknown): { passed: number; total: number } | null {
  const counts = record(value);
  if (typeof counts.passed !== "number" || typeof counts.total !== "number") return null;
  const total = boundedInteger(counts.total, 0, 200);
  return { passed: boundedInteger(counts.passed, 0, total), total };
}

function diagnosticProgress(value: unknown): NonNullable<ExerciseEvidence["diagnostic"]> | undefined {
  const input = record(value);
  if (!Array.isArray(input.submissions) || !Array.isArray(input.assistedAttemptIds)) return undefined;
  const assistedAttemptIds = [...new Set(input.assistedAttemptIds
    .filter((id): id is string => typeof id === "string" && id.length > 0 && id.length <= limits.learningIdChars))].slice(-20);
  const submissions = input.submissions.slice(-20).flatMap(raw => {
    const item = record(raw), snapshot = text(item.snapshot, limits.predictionChars);
    let parsed: Record<string, unknown>;
    try { parsed = record(JSON.parse(snapshot)); } catch { return []; }
    if (parsed.v !== 1 || !Number.isInteger(item.revision) || !Number.isInteger(item.contentVersion)
      || !validTimestamp(item.recordedAt) || !["learn", "recall", "none"].includes(String(item.mode))) return [];
    const idPattern = /^(?:D|(?:0[0-9]|1[0-9]|2[0-3]))\.\d{2}$/;
    const coverage: Record<string, boolean> = {};
    for (const [id, covered] of Object.entries(record(item.coverage)).slice(0, 12)) {
      if (idPattern.test(id) && typeof covered === "boolean") coverage[id] = covered;
    }
    const recommendations = Array.isArray(item.recommendations)
      ? [...new Set(item.recommendations.filter((id): id is string => typeof id === "string" && idPattern.test(id)))].slice(0, 4)
      : [];
    return [{
      attemptId: text(item.attemptId, limits.learningIdChars),
      revision: boundedInteger(item.revision, 0, 1000000),
      contentVersion: boundedInteger(item.contentVersion, 1, limits.contentVersion),
      snapshot,
      mode: item.mode as "learn" | "recall" | "none",
      independent: item.independent === true,
      assisted: item.assisted === true,
      coverage,
      recommendations,
      recordedAt: item.recordedAt,
    }];
  });
  return {assistedAttemptIds, submissions};
}


export function sanitizeEvidence(value: unknown): ExerciseEvidence | null {
  const item = record(value);
  if (item.status !== "executed" && item.status !== "written") return null;
  if (!["result", "error", "timeout", "guided"].includes(String(item.runResult))) return null;
  const tests = testCounts(item.tests);
  const source = ["browser", "rubric-declared", "local-declared"].includes(String(item.source))
    ? { source: item.source as ExerciseEvidence["source"] }
    : {};
  return {
    status: item.status,
    runResult: item.runResult as ExerciseEvidence["runResult"],
    output: text(item.output, limits.outputChars),
    rubric: Array.isArray(item.rubric)
      ? [...new Set(item.rubric.filter((index): index is number => typeof index === "number" && Number.isInteger(index) && index >= 0 && index < limits.rubricItems))].slice(0, limits.rubricItems)
      : [],
    runCount: boundedInteger(item.runCount, 0, limits.attemptCount),
    ...(typeof item.rubricFingerprint === "string" && /^sha256:[a-f0-9]{64}$/.test(item.rubricFingerprint)
      ? { rubricFingerprint: item.rubricFingerprint }
      : {}),
    ...source,
    ...(typeof item.testsPassed === "boolean" ? { testsPassed: item.testsPassed } : {}),
    ...(tests ? { tests } : {}),
    ...(validTimestamp(item.recordedAt) ? { recordedAt: item.recordedAt } : {}),
    ...(diagnosticProgress(item.diagnostic) ? { diagnostic: diagnosticProgress(item.diagnostic) } : {})
  };
}

export const reviewFormats = ["choice-predict", "predict-code", "short-fix", "mini-impl"] as const;
export const reviewVariantIdPattern = /^var\.(?:D|\d{2})\.\d{2}\.[a-z0-9][a-z0-9-]{0,60}$/;
const reviewAttemptKeyPattern = /^(var\.(?:D|\d{2})\.\d{2}\.[a-z0-9][a-z0-9-]{0,60})(?:@v([1-9]\d{0,2}))?$/;

function variantId(value: unknown): string | undefined {
  return typeof value === "string" && value.length <= limits.learningIdChars && reviewVariantIdPattern.test(value) ? value : undefined;
}

function reviewFormat(value: unknown): ReviewFormat | undefined {
  return reviewFormats.includes(value as ReviewFormat) ? value as ReviewFormat : undefined;
}

function reviewHistory(value: unknown): ReviewHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value.slice(-limits.reviewHistory).flatMap((raw): ReviewHistoryEntry[] => {
    const item = record(raw);
    const id = variantId(item.variantId), format = reviewFormat(item.format);
    if (!id || !format || (item.result !== "passed" && item.result !== "failed") || !validTimestamp(item.at)) return [];
    return [{ variantId: id, format, result: item.result, at: item.at }];
  });
}

export function sanitizeSchedules(value: unknown, slugs: Set<string>): Record<string, ReviewSchedule> {
  const clean: Record<string, ReviewSchedule> = {};
  for (const [slug, raw] of Object.entries(record(value))) {
    if (!slugs.has(slug)) continue;
    const schedule = record(raw);
    if (typeof schedule.dueAt !== "number" || !Number.isFinite(schedule.dueAt)) continue;
    const lastVariantId = variantId(schedule.lastVariantId);
    const lastFormat = reviewFormat(schedule.lastFormat);
    const history = reviewHistory(schedule.history);
    clean[slug] = {
      intervalIndex: boundedInteger(schedule.intervalIndex, -1, limits.reviewIntervalIndex, 0),
      dueAt: Math.max(0, Math.trunc(schedule.dueAt)),
      ...(validTimestamp(schedule.lastReviewedAt) ? { lastReviewedAt: schedule.lastReviewedAt } : {}),
      ...(lastVariantId ? { lastVariantId } : {}),
      ...(lastFormat ? { lastFormat } : {}),
      ...(history.length ? { history } : {})
    };
  }
  return clean;
}

function reviewAttempt(key: string, value: unknown, slugs: Set<string>): ReviewAttempt | null {
  const match = reviewAttemptKeyPattern.exec(key);
  const item = record(value);
  if (!match || match[1].length > limits.learningIdChars) return null;
  const activityId = typeof item.activityId === "string" ? item.activityId : "";
  const format = reviewFormat(item.format);
  if (!slugs.has(activityId) || !match[1].startsWith(`var.${activityId}.`) || !format) return null;
  if (typeof item.draft !== "string" || (item.status !== "pending" && item.status !== "passed" && item.status !== "failed")) return null;
  return {
    activityId,
    contentVersion: boundedInteger(item.contentVersion, 1, limits.contentVersion),
    format,
    draft: text(item.draft, limits.draftChars),
    status: item.status,
    usedHelp: item.usedHelp === true,
    startedAt: boundedInteger(item.startedAt, 0, Number.MAX_SAFE_INTEGER),
    finishedAt: boundedInteger(item.finishedAt, 0, Number.MAX_SAFE_INTEGER)
  };
}

export function sanitizeReviewAttempts(value: unknown, slugs: Set<string>): { attempts: Record<string, ReviewAttempt>; dropped: number } {
  const candidates: [string, ReviewAttempt][] = [];
  for (const [key, raw] of Object.entries(record(value))) {
    const attempt = reviewAttempt(key, raw, slugs);
    if (attempt) candidates.push([key, attempt]);
  }
  return boundReviewAttempts(candidates);
}

const attemptSize = ([key, attempt]: [string, ReviewAttempt]) => JSON.stringify([key, attempt]).length;

/**
 * Keeps pending attempts (their drafts are unsaved work) first, then the most recent finished ones,
 * within both the count limit and reviewPayloadChars. Returns the kept entries in their input order.
 */
export function boundReviewAttempts(candidates: [string, ReviewAttempt][]): { attempts: Record<string, ReviewAttempt>; dropped: number } {
  const priority = [...candidates].sort((a, b) => {
    const pendingA = a[1].status === "pending" ? 0 : 1, pendingB = b[1].status === "pending" ? 0 : 1;
    if (pendingA !== pendingB) return pendingA - pendingB;
    return Math.max(b[1].finishedAt, b[1].startedAt) - Math.max(a[1].finishedAt, a[1].startedAt) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
  });
  const kept = new Set<string>();
  let chars = 0;
  for (const entry of priority) {
    const size = attemptSize(entry);
    if (kept.size >= limits.reviewAttempts || chars + size > limits.reviewPayloadChars) continue;
    kept.add(entry[0]);
    chars += size;
  }
  const attempts: Record<string, ReviewAttempt> = {};
  for (const [key, attempt] of candidates) if (kept.has(key)) attempts[key] = attempt;
  return { attempts, dropped: candidates.length - kept.size };
}
