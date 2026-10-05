(function (global) {
  "use strict";

  function create({ snapshot, status, issue }) {
    let state = "loading";
    let loaded = false;
    let revision;
    let backupKey;
    let saving = false;
    let pendingSource;
    let fallbackBackup;

    const pending = () => {
      try { return sessionStorage.getItem(backupKey) || fallbackBackup; }
      catch { return fallbackBackup; }
    };
    const preserve = () => {
      fallbackBackup = JSON.stringify({ progress: JSON.parse(snapshot()), revision, savedAt: new Date().toISOString() });
      try { sessionStorage.setItem(backupKey, fallbackBackup); }
      catch { /* The in-memory copy remains downloadable if storage is unavailable. */ }
    };
    const clearBackup = () => {
      fallbackBackup = null;
      try { sessionStorage.removeItem(backupKey); }
      catch { /* Saving to the account still succeeded. */ }
    };

    async function load() {
      const response = await fetch("/api/progress", { cache: "no-store" });
      if (!response.ok) throw new Error("load failed");
      const data = await response.json();
      if (!data.progress || typeof data.progress !== "object" || Array.isArray(data.progress) ||
          typeof data.revision !== "string" || typeof data.accountKey !== "string") throw new Error("invalid progress response");
      revision = data.revision;
      backupKey = `devpath-pending:${data.accountKey}`;
      loaded = true;
      state = pending() ? "recovery" : "ready";
      if (state === "recovery") issue(state, "Existe uma tentativa não sincronizada desta aba. Baixe a cópia antes de continuar com o progresso da conta.");
      return data.progress;
    }

    function save(source) {
      if (!loaded || state === "recovery") return;
      preserve();
      if (state !== "ready") return;
      pendingSource = source;
      status("salvando…");
      if (saving) return;
      saving = true;
      void (async () => {
       while (pendingSource !== undefined && state === "ready") {
        const source = pendingSource;
        pendingSource = undefined;
        const response = await fetch("/api/progress", {
          method: "PUT", headers: { "Content-Type": "application/json", "If-Match": revision }, body: source
        });
        if (!response.ok) {
          state = response.status === 409 || response.status === 428 ? "conflict" : "paused";
          preserve();
          const message = state === "conflict"
            ? "Seu progresso mudou em outra aba ou dispositivo. Esta tentativa foi preservada neste navegador."
            : "Não foi possível salvar na conta. Esta tentativa foi preservada; tente salvar novamente.";
          status("tentativa ainda não sincronizada");
          issue(state, message);
          return;
        }
        const data = await response.json();
        if (typeof data.revision !== "string") throw new Error("missing saved revision");
        revision = data.revision;
        if (source === snapshot()) clearBackup();
        status(pendingSource === undefined ? "progresso salvo" : "salvando…");
        issue(null);
       }
      })().catch(() => {
        state = "paused";
        preserve();
        status("tentativa ainda não sincronizada");
        issue(state, "Não foi possível confirmar o salvamento. Sua tentativa foi preservada; tente novamente.");
      }).finally(() => { saving = false; });
    }

    return Object.freeze({
      load, save, pending,
      get loaded() { return loaded; },
      get ready() { return state === "ready"; },
      retry() { if (state === "paused") { state = "ready"; save(snapshot()); } },
      continueFromAccount() {
        if (state !== "recovery") return;
        clearBackup();
        state = "ready";
        issue(null);
      }
    });
  }

  global.DevPathProgressSync = Object.freeze({ create });
})(window);
