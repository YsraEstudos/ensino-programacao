import { getD1 } from "../../../db";
import { getChatGPTUser } from "../../chatgpt-auth";

export const dynamic = "force-dynamic";

const slugs = new Set(["web", "html", "css", "00.01", "00.02", "00.03", "00.04", "00.05"]);
const exerciseIds = new Set(["00.01", "00.02", "00.03", "00.04", "00.05"]);
type UserProgress = {
  completed: string[];
  answers: Record<string, boolean>;
  attempts: Record<string, number>;
  challenges: Record<string, { text: string; submittedAt: string }>;
  exerciseDrafts: Record<string, string>;
  exercisePredictions: Record<string, string>;
  exerciseReflections: Record<string, string>;
  warmupCompleted: Record<string, boolean>;
  reviewSchedule: Record<string, { intervalIndex: number; dueAt: number; lastReviewedAt?: string }>;
  lastLesson: string | null;
  activeDays: string[];
  reviewIndex: number;
  lastReview: string | null;
};

const emptyProgress: UserProgress = {
  completed: [], answers: {}, attempts: {}, challenges: {}, exerciseDrafts: {},
  exercisePredictions: {}, exerciseReflections: {}, warmupCompleted: {}, reviewSchedule: {},
  lastLesson: null, activeDays: [], reviewIndex: 0, lastReview: null,
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
}

function validDate(value: unknown): string | null {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function sanitize(value: unknown): UserProgress {
  const input = record(value);
  const answers = record(input.answers);
  const attempts = record(input.attempts);
  const challenges = record(input.challenges);
  const drafts = record(input.exerciseDrafts);
  const predictions = record(input.exercisePredictions);
  const reflections = record(input.exerciseReflections);
  const warmups = record(input.warmupCompleted);
  const schedules = record(input.reviewSchedule);
  const cleanAnswers: Record<string, boolean> = {};
  const cleanAttempts: Record<string, number> = {};
  const cleanChallenges: Record<string, { text: string; submittedAt: string }> = {};
  const cleanDrafts: Record<string, string> = {};
  const cleanPredictions: Record<string, string> = {};
  const cleanReflections: Record<string, string> = {};
  const cleanWarmups: Record<string, boolean> = {};
  const cleanSchedules: Record<string, { intervalIndex: number; dueAt: number; lastReviewedAt?: string }> = {};

  for (const slug of slugs) {
    if (typeof answers[slug] === "boolean") cleanAnswers[slug] = answers[slug] as boolean;
    if (typeof attempts[slug] === "number" && Number.isInteger(attempts[slug]) && attempts[slug] >= 0) cleanAttempts[slug] = Math.min(attempts[slug], 100000);
    const challenge = record(challenges[slug]);
    if (typeof challenge.text === "string" && challenge.text.length <= 600) {
      cleanChallenges[slug] = {
        text: challenge.text,
        submittedAt: typeof challenge.submittedAt === "string" && !Number.isNaN(Date.parse(challenge.submittedAt)) ? challenge.submittedAt : new Date().toISOString(),
      };
    }
    const schedule = record(schedules[slug]);
    if (typeof schedule.dueAt === "number" && Number.isFinite(schedule.dueAt)) {
      cleanSchedules[slug] = {
        intervalIndex: Math.max(0, Math.min(3, Math.trunc(Number(schedule.intervalIndex) || 0))),
        dueAt: Math.max(0, Math.trunc(Number(schedule.dueAt))),
        ...(typeof schedule.lastReviewedAt === "string" && !Number.isNaN(Date.parse(schedule.lastReviewedAt)) ? { lastReviewedAt: schedule.lastReviewedAt } : {}),
      };
    }
  }

  for (const id of exerciseIds) {
    if (typeof drafts[id] === "string") cleanDrafts[id] = (drafts[id] as string).slice(0, 600);
    if (typeof predictions[id] === "string") cleanPredictions[id] = (predictions[id] as string).slice(0, 120);
    if (typeof reflections[id] === "string") cleanReflections[id] = (reflections[id] as string).slice(0, 300);
    if (typeof warmups[id] === "boolean") cleanWarmups[id] = warmups[id] as boolean;
  }

  return {
    completed: Array.isArray(input.completed) ? [...new Set(input.completed.filter((slug): slug is string => typeof slug === "string" && slugs.has(slug)))] : [],
    answers: cleanAnswers,
    attempts: cleanAttempts,
    challenges: cleanChallenges,
    exerciseDrafts: cleanDrafts,
    exercisePredictions: cleanPredictions,
    exerciseReflections: cleanReflections,
    warmupCompleted: cleanWarmups,
    reviewSchedule: cleanSchedules,
    lastLesson: typeof input.lastLesson === "string" && slugs.has(input.lastLesson) ? input.lastLesson : null,
    activeDays: Array.isArray(input.activeDays) ? [...new Set(input.activeDays.map(validDate).filter((day): day is string => Boolean(day)))].slice(-30) : [],
    reviewIndex: typeof input.reviewIndex === "number" && Number.isInteger(input.reviewIndex) ? Math.max(0, Math.min(3, input.reviewIndex)) : 0,
    lastReview: validDate(input.lastReview),
  };
}

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Entre com sua conta para continuar." }, { status: 401 });
  try {
    const row = await getD1().prepare("SELECT progress_json FROM user_progress WHERE user_id = ?1").bind(user.userId).first<{ progress_json: string }>();
    let progress = emptyProgress;
    if (row?.progress_json) {
      try { progress = sanitize(JSON.parse(row.progress_json)); }
      catch { console.error("Invalid saved DevPath progress for account", user.userId); }
    }
    return Response.json({ progress }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("DevPath progress load failed", error);
    return Response.json({ error: "Não foi possível carregar o progresso agora." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Entre com sua conta para continuar." }, { status: 401 });
  try {
    const payload: unknown = await request.json();
    if (JSON.stringify(payload).length > 12000) return Response.json({ error: "O progresso enviado excede o limite." }, { status: 413 });
    const progress = sanitize(payload);
    await getD1().prepare("INSERT INTO user_progress (user_id, progress_json, updated_at) VALUES (?1, ?2, unixepoch()) ON CONFLICT(user_id) DO UPDATE SET progress_json = excluded.progress_json, updated_at = unixepoch()")
      .bind(user.userId, JSON.stringify(progress)).run();
    return Response.json({ saved: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("DevPath progress save failed", error);
    return Response.json({ error: "Não foi possível salvar o progresso agora." }, { status: 503 });
  }
}
