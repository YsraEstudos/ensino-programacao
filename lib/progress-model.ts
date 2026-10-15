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
export type ReviewFormat = "choice-predict" | "predict-code" | "short-fix" | "mini-impl";
export type ReviewResult = "passed" | "failed";
export type ReviewHistoryEntry = { variantId: string; format: ReviewFormat; result: ReviewResult; at: string };
export type ReviewSchedule = {
  intervalIndex: number;
  dueAt: number;
  lastReviewedAt?: string;
  /** Variant and format of the last graded review, used to alternate between sessions. */
  lastVariantId?: string;
  lastFormat?: ReviewFormat;
  /** Most recent graded reviews, at most reviewHistory entries. */
  history?: ReviewHistoryEntry[];
};
/** A review attempt is persisted before it is evaluated. A review never grants "demonstrated". */
export type ReviewAttempt = {
  activityId: string;
  contentVersion: number;
  format: ReviewFormat;
  /** Learner response: choice index as text, or the code/answer text. Capped by draftChars. */
  draft: string;
  status: "pending" | "passed" | "failed";
  usedHelp: boolean;
  startedAt: number;
  finishedAt: number;
};
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
  reviewAttempts: Record<string, ReviewAttempt>;
  lastLesson: string | null;
  activeDays: string[];
  reviewIndex: number;
  lastReview: string | null;
  // Learner opted in to reviews of optional activities (they are never counted as core).
  reviewOptIn: boolean;
};

export function createEmptyProgress(): UserProgress {
  return structuredClone(contract.defaults);
}
