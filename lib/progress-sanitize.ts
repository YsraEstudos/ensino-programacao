import { courseExerciseIds } from "./course-exercise-ids";
import { limits } from "./progress-contract.json";
import { createEmptyProgress, type UserProgress } from "./progress-model";
import { sanitizeEvidence, sanitizeSchedules } from "./progress-evidence";
import { record, text, validDate, validTimestamp, boundedInteger } from "./progress-values";
import { sanitizeStage01Progress } from "./stage01-progress";
import { sanitizeStage02Progress } from "./stage02-progress";

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

function sanitizeExerciseData(input: Record<string, unknown>, clean: UserProgress) {
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
}

export function sanitizeUserProgress(value: unknown): UserProgress {
  const input = record(value);
  const clean = createEmptyProgress();
  sanitizeCompletion(input, clean);
  sanitizeExerciseData(input, clean);
  clean.stage01 = sanitizeStage01Progress(input.stage01);
  clean.stage02 = sanitizeStage02Progress(input.stage02);
  clean.reviewSchedule = sanitizeSchedules(input.reviewSchedule, slugs);
  clean.lastLesson = typeof input.lastLesson === "string" && slugs.has(input.lastLesson) ? input.lastLesson : null;
  clean.activeDays = Array.isArray(input.activeDays)
    ? [...new Set(input.activeDays.map(validDate).filter((day): day is string => Boolean(day)))].slice(-limits.activeDays) : [];
  clean.reviewIndex = boundedInteger(input.reviewIndex, 0, courseExerciseIds.length - 1);
  clean.lastReview = validDate(input.lastReview);
  return clean;
}
