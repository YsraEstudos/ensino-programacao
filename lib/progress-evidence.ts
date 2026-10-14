import { limits } from "./progress-contract.json";
import type { ExerciseEvidence, ReviewSchedule } from "./progress-model";
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

export function sanitizeSchedules(value: unknown, slugs: Set<string>): Record<string, ReviewSchedule> {
  const clean: Record<string, ReviewSchedule> = {};
  for (const [slug, raw] of Object.entries(record(value))) {
    if (!slugs.has(slug)) continue;
    const schedule = record(raw);
    if (typeof schedule.dueAt !== "number" || !Number.isFinite(schedule.dueAt)) continue;
    clean[slug] = {
      intervalIndex: boundedInteger(schedule.intervalIndex, -1, limits.reviewIntervalIndex, 0),
      dueAt: Math.max(0, Math.trunc(schedule.dueAt)),
      ...(validTimestamp(schedule.lastReviewedAt) ? { lastReviewedAt: schedule.lastReviewedAt } : {})
    };
  }
  return clean;
}
