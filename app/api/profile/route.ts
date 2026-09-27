import { getChatGPTUser } from "../../chatgpt-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Entre com sua conta para continuar." }, { status: 401 });
  return Response.json({ displayName: user.displayName, email: user.email }, { headers: { "Cache-Control": "private, no-store" } });
}
