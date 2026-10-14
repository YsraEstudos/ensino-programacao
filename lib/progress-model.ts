import contract from "./progress-contract.json";
import type { Stage01State } from "./stage01-progress";
import type { Stage02State } from "./stage02-progress";
import type { LearningRecord } from "./learning-progress";

export type ExerciseEvidence = {
  status: "executed" | "written";
  runResult: "result" | "error" | "timeout" | "guided";
  output: string;
  rubric: number[];
  runCount: number;
  /** Identity of the visible checklist explicitly reviewed for this evidence. */
  rubricFingerprint?: string;
  source?: "browser" | "rubric-declared" | "local-declared";
  /** Set only for activities checked by the built-in tests: true when every test passed. */
  testsPassed?: boolean;
  tests?: { passed: number; total: number };
  recordedAt?: string;
  /** Versioned, declared diagnostic submissions; these never promote learning evidence. */
  diagnostic?: {
    assistedAttemptIds: string[];
    submissions: Array<{
      attemptId: string;
      revision: number;
      contentVersion: number;
      snapshot: string;
      mode: "learn" | "recall" | "none";
      independent: boolean;
      assisted: boolean;
      coverage: Record<string, boolean>;
      recommendations: string[];
      recordedAt: string;
    }>;
  };
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
  exerciseLearning: Record<string, LearningRecord>;
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
