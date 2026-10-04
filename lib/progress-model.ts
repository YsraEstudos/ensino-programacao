import contract from "./progress-contract.json";
import type { Stage01State } from "./stage01-progress";
import type { Stage02State } from "./stage02-progress";

export type ExerciseEvidence = {
  status: "executed" | "written";
  runResult: "result" | "error" | "timeout" | "guided";
  output: string;
  rubric: number[];
  runCount: number;
  recordedAt?: string;
};
export type ReviewSchedule = { intervalIndex: number; dueAt: number; lastReviewedAt?: string };
export type UserProgress = {
  stage01: Record<string, Stage01State>;
  stage02: Record<string, Stage02State>;
  completed: string[];
  answers: Record<string, boolean>;
  exerciseVersions: Record<string, number>;
  attempts: Record<string, number>;
  challenges: Record<string, { text: string; submittedAt: string }>;
  exerciseDrafts: Record<string, string>;
  exercisePredictions: Record<string, string>;
  exerciseReflections: Record<string, string>;
  exerciseEvidence: Record<string, ExerciseEvidence>;
  warmupCompleted: Record<string, boolean>;
  reviewSchedule: Record<string, ReviewSchedule>;
  lastLesson: string | null;
  activeDays: string[];
  reviewIndex: number;
  lastReview: string | null;
};

export function createEmptyProgress(): UserProgress {
  return structuredClone(contract.defaults);
}
