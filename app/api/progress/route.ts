import { getD1 } from "../../../db";
import { getChatGPTUser } from "../../chatgpt-auth";
import { createEmptyProgress } from "../../../lib/progress-model";
import { sanitizeUserProgress } from "../../../lib/progress-sanitize";
import { readProgressBody, ProgressRequestError } from "../../../lib/progress-request";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };
const unavailable = () => Response.json({ error: "Não foi possível acessar seu progresso. Tente novamente sem fechar esta página." }, { status: 503, headers });
const conflict = () => Response.json({ error: "Seu progresso mudou em outra aba ou dispositivo. Sua tentativa foi preservada neste navegador." }, { status: 409, headers });

async function revisionOf(source: string | null): Promise<string> {
  if (source === null) return '"empty"';
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(source));
  return `"${Array.from(new Uint8Array(hash), value => value.toString(16).padStart(2, "0")).join("")}"`;
}

function savedProgress(source: string) {
  const value: unknown = JSON.parse(source);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid stored progress");
  return sanitizeUserProgress(value);
}

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Entre com sua conta para continuar." }, { status: 401, headers });
  try {
    const row = await getD1().prepare("SELECT progress_json FROM user_progress WHERE user_id = ?1")
      .bind(user.userId).first<{ progress_json: string }>();
    const source = row ? row.progress_json : null;
    const progress = source === null ? createEmptyProgress() : savedProgress(source);
    const revision = await revisionOf(source);
    const accountKey = await revisionOf(user.userId);
    return Response.json({ progress, revision, accountKey }, { headers: { ...headers, ETag: revision } });
  } catch (error) {
    console.error("DevPath progress load failed", error);
    return unavailable();
  }
}

export async function PUT(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Entre com sua conta para continuar." }, { status: 401, headers });
  try {
    const payload = await readProgressBody(request);
    const expectedRevision = request.headers.get("If-Match");
    if (!expectedRevision) {
      return Response.json({ error: "Atualize a página antes de salvar seu progresso." }, { status: 428, headers });
    }
    const db = getD1();
    const row = await db.prepare("SELECT progress_json FROM user_progress WHERE user_id = ?1")
      .bind(user.userId).first<{ progress_json: string }>();
    const source = row ? row.progress_json : null;
    if (source !== null) savedProgress(source);
    if (expectedRevision !== await revisionOf(source)) return conflict();
    const serialized = JSON.stringify(sanitizeUserProgress(payload));
    const statement = source === null
      ? db.prepare("INSERT OR IGNORE INTO user_progress (user_id, progress_json, updated_at) VALUES (?1, ?2, unixepoch())").bind(user.userId, serialized)
      : db.prepare("UPDATE user_progress SET progress_json = ?2, updated_at = unixepoch() WHERE user_id = ?1 AND progress_json = ?3").bind(user.userId, serialized, source);
    const result = await statement.run();
    if (result.meta.changes !== 1) return conflict();
    const revision = await revisionOf(serialized);
    return Response.json({ saved: true, revision }, { headers: { ...headers, ETag: revision } });
  } catch (error) {
    if (error instanceof ProgressRequestError) return Response.json({ error: error.message }, { status: error.status, headers });
    console.error("DevPath progress save failed", error);
    return unavailable();
  }
}
