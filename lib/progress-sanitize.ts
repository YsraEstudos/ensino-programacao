import { courseExerciseIds } from "./course-exercise-ids";
import { limits } from "./progress-contract.json";
import { createEmptyProgress, type UserProgress } from "./progress-model";
import { sanitizeEvidence, sanitizeReviewAttempts, sanitizeSchedules } from "./progress-evidence";
import { record, text, validDate, validTimestamp, boundedInteger } from "./progress-values";
import { sanitizeStage01Progress } from "./stage01-progress";
import { sanitizeStage02Progress } from "./stage02-progress";
import { sanitizeLearningRecord, type LearningRecord } from "./learning-progress";

const exerciseIds = new Set<string>(courseExerciseIds);
const slugs = new Set(["web", "html", "css", ...exerciseIds]);

function isExerciseDataKey(value: string): boolean {
  if (exerciseIds.has(value)) return true;
  const versioned = /^(.+)@v([1-9]\d{0,2})$/.exec(value);
  return Boolean(versioned && exerciseIds.has(versioned[1]));
}

function sanitizeCompletion(input: Record<string, unknown>, clean: UserProgress) {
  const answers = record(input.answers);
  const attempts = record(input.attempts);
  const challenges = record(input.challenges);
  for (const slug of slugs) {
    if (typeof answers[slug] === "boolean") clean.answers[slug] = answers[slug] as boolean;
    const count = attempts[slug];
    if (typeof count === "number" && Number.isInteger(count) && count >= 0) clean.attempts[slug] = Math.min(count, limits.attemptCount);
    const challenge = record(challenges[slug]);
    if (typeof challenge.text === "string" && challenge.text.length <= limits.reflectionChars) {
      clean.challenges[slug] = {
        text: challenge.text,
        submittedAt: validTimestamp(challenge.submittedAt) ? challenge.submittedAt : new Date().toISOString()
      };
    }
  }
  clean.completed = Array.isArray(input.completed)
    ? [...new Set(input.completed.filter((slug): slug is string => typeof slug === "string" && slugs.has(slug)))] : [];
}

export type ProgressSanitizeReport = {
  // Valid learning records dropped because the per-user limit was exceeded (most recently updated are kept).
  droppedLearningRecords: number;
  // Review attempts dropped by the count or reviewPayloadChars budget; pending drafts are kept first.
  droppedReviewAttempts: number;
  truncated: boolean;
};

function sanitizeExerciseData(input: Record<string, unknown>, clean: UserProgress): number {
  const fields = [
    ["exerciseDrafts", limits.draftChars],
    ["exercisePredictions", limits.predictionChars],
    ["exerciseReflections", limits.reflectionChars]
  ] as const;
  for (const [field, limit] of fields) {
    for (const [key, value] of Object.entries(record(input[field]))) {
      if (isExerciseDataKey(key) && typeof value === "string") clean[field][key] = text(value, limit);
    }
  }
  for (const [id, value] of Object.entries(record(input.exerciseVersions))) {
    if (exerciseIds.has(id) && typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= limits.contentVersion) clean.exerciseVersions[id] = value;
  }
  for (const [key, value] of Object.entries(record(input.exerciseEvidence))) {
    if (!isExerciseDataKey(key)) continue;
    const evidence = sanitizeEvidence(value);
    if (evidence) clean.exerciseEvidence[key] = evidence;
  }
  for (const [key, value] of Object.entries(record(input.warmupCompleted))) {
    if (isExerciseDataKey(key) && typeof value === "boolean") clean.warmupCompleted[key] = value;
  }
  const candidates: [string, LearningRecord][] = [];
  for (const [id, value] of Object.entries(record(input.exerciseLearning))) {
    if (!exerciseIds.has(id)) continue;
    const learning = sanitizeLearningRecord(value);
    if (learning) candidates.push([id, learning]);
  }
  const kept = new Set(
    [...candidates]
      .sort((a, b) => Date.parse(b[1].currentUpdatedAt) - Date.parse(a[1].currentUpdatedAt) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
      .slice(0, limits.learningRecords)
      .map(([id]) => id)
  );
  for (const [id, learning] of candidates) {
    if (kept.has(id)) clean.exerciseLearning[id] = learning;
  }
  return candidates.length - kept.size;
}

export function sanitizeUserProgressWithReport(value: unknown): { progress: UserProgress; report: ProgressSanitizeReport } {
  const input = record(value);
  const clean = createEmptyProgress();
  sanitizeCompletion(input, clean);
  const droppedLearningRecords = sanitizeExerciseData(input, clean);
  clean.stage01 = sanitizeStage01Progress(input.stage01);
  clean.stage02 = sanitizeStage02Progress(input.stage02);
  clean.reviewSchedule = sanitizeSchedules(input.reviewSchedule, slugs);
  const review = sanitizeReviewAttempts(input.reviewAttempts, slugs);
  clean.reviewAttempts = review.attempts;
  clean.lastLesson = typeof input.lastLesson === "string" && slugs.has(input.lastLesson) ? input.lastLesson : null;
  clean.activeDays = Array.isArray(input.activeDays)
    ? [...new Set(input.activeDays.map(validDate).filter((day): day is string => Boolean(day)))].slice(-limits.activeDays) : [];
  clean.reviewIndex = boundedInteger(input.reviewIndex, 0, courseExerciseIds.length - 1);
  clean.lastReview = validDate(input.lastReview);
  clean.reviewOptIn = input.reviewOptIn === true;
  const droppedReviewAttempts = review.dropped;
  return {
    progress: clean,
    report: { droppedLearningRecords, droppedReviewAttempts, truncated: droppedLearningRecords + droppedReviewAttempts > 0 }
  };
}

export function sanitizeUserProgress(value: unknown): UserProgress {
  return sanitizeUserProgressWithReport(value).progress;
}
