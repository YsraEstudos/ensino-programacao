(function (global) {
  "use strict";

  function create({ snapshot, status, issue, merge }) {
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
      const backup = pending();
      if (!backup) {
        state = "ready";
        return data.progress;
      }
      state = "recovery";
      let recovered = data.progress;
      try {
        const saved = JSON.parse(backup);
        if (saved?.progress && typeof saved.progress === "object" && !Array.isArray(saved.progress)) {
          recovered = typeof merge === "function" ? merge(saved.progress, data.progress) : { ...data.progress, ...saved.progress };
        }
      } catch { /* The original backup remains available for download. */ }
      issue(state, "Há uma tentativa não sincronizada. Ela foi combinada com o progresso da conta; baixe a cópia antes de salvar o resultado combinado.");
      return recovered;
    }

    function save(source) {
      if (!loaded) return;
      // Every save while not synchronized updates the status, so the learner never sees "salvando…" stay on screen.
      if (state === "recovery") {
        status("alterações guardadas neste dispositivo; escolha como continuar a sincronização");
        return;
      }
      preserve();
      if (state !== "ready") {
        status(state === "conflict"
          ? "alterações guardadas neste dispositivo; conflito de sincronização"
          : "alterações guardadas neste dispositivo; sincronização pausada");
        return;
      }
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
        save(snapshot());
      }
    });
  }

  global.DevPathProgressSync = Object.freeze({ create });
})(window);
