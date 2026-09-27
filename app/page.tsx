import { chatGPTSignOutPath, requireChatGPTUser } from "./chatgpt-auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await requireChatGPTUser("/");
  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-[#11120f] text-[#f2f2eb]">
      <header className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#171815] px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2 font-extrabold tracking-tight" aria-label="DevPath início">
          <span className="rounded-lg bg-[#d9fc68] px-2 py-1 font-mono text-sm text-[#1c2518]">&lt;/&gt;</span>
          <span>devpath<span className="text-[#d9fc68]">.</span></span>
        </a>
        <div className="flex min-w-0 items-center gap-3 text-sm">
          <span className="hidden max-w-[min(42vw,22rem)] truncate text-white/75 sm:inline" title={user.email}>
            {user.fullName ?? user.email}
          </span>
          <a href={chatGPTSignOutPath("/")} target="_top" className="rounded-lg border border-white/15 px-3 py-2 font-semibold hover:border-[#d9fc68]/70 hover:text-[#d9fc68]">
            Sair
          </a>
        </div>
      </header>
      <iframe src="/devpath.html" title="Área de aprendizagem DevPath" className="min-h-0 w-full flex-1 border-0 bg-[#11120f]" />
    </main>
  );
}
