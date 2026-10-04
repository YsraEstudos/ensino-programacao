import { limits } from "./progress-contract.json";

export class ProgressRequestError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function readProgressBody(request: Request): Promise<Record<string, unknown>> {
  const length = Number(request.headers.get("Content-Length"));
  if (Number.isFinite(length) && length > limits.requestBytes) {
    await request.body?.cancel().catch(() => {});
    throw new ProgressRequestError(413, "O progresso enviado excede o limite.");
  }
  if (!request.body) throw new ProgressRequestError(400, "Envie um objeto JSON de progresso.");
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
  let source = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > limits.requestBytes) {
        await reader.cancel().catch(() => {});
        throw new ProgressRequestError(413, "O progresso enviado excede o limite.");
      }
      source += decoder.decode(value, { stream: true });
    }
    source += decoder.decode();
    const payload: unknown = JSON.parse(source);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Expected object");
    return payload as Record<string, unknown>;
  } catch (error) {
    if (error instanceof ProgressRequestError) throw error;
    await reader.cancel().catch(() => {});
    throw new ProgressRequestError(400, "O progresso enviado não contém um objeto JSON válido.");
  } finally { reader.releaseLock(); }
}
