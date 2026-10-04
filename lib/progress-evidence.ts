import { limits } from "./progress-contract.json";
import type { ExerciseEvidence, ReviewSchedule } from "./progress-model";
import { boundedInteger, record, text, validTimestamp } from "./progress-values";

export function sanitizeEvidence(value: unknown): ExerciseEvidence | null {
  const item = record(value);
  if (item.status !== "executed" && item.status !== "written") return null;
  if (!["result", "error", "timeout", "guided"].includes(String(item.runResult))) return null;
  return {
    status: item.status,
    runResult: item.runResult as ExerciseEvidence["runResult"],
    output: text(item.output, limits.outputChars),
    rubric: Array.isArray(item.rubric)
      ? [...new Set(item.rubric.filter((index): index is number => typeof index === "number" && Number.isInteger(index) && index >= 0 && index < limits.rubricItems))].slice(0, limits.rubricItems)
      : [],
    runCount: boundedInteger(item.runCount, 0, limits.attemptCount),
    ...(validTimestamp(item.recordedAt) ? { recordedAt: item.recordedAt } : {})
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
