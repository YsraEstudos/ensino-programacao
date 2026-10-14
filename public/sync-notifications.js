(function (global) {
    "use strict";
    // Injected dependencies: progressSync, render, view.
    function create(ctx) {
        function showSyncIssue(state, message) {
            document.querySelector("#progress-sync-issue")?.remove();
            ctx.view.inert = state === "recovery";
            if (!state)
                return;
            const panel = document.createElement("section");
            panel.id = "progress-sync-issue";
            panel.className = "course-gate-note";
            panel.setAttribute("role", "alert");
            const copy = document.createElement("p");
            copy.textContent = message;
            const download = document.createElement("button");
            download.type = "button";
            download.className = "button-secondary";
            download.textContent = "Baixar cópia desta tentativa";
            const action = document.createElement("button");
            action.type = "button";
            action.className = "button-secondary";
            action.textContent = state === "recovery" ? "Salvar tentativa combinada"
                : state === "paused" ? "Tentar salvar novamente" : "Recarregar progresso da conta";
            action.disabled = state === "recovery";
            download.addEventListener("click", () => {
                const source = ctx.progressSync.pending();
                if (!source)
                    return;
                const url = URL.createObjectURL(new Blob([source], { type: "application/json" }));
                const link = document.createElement("a");
                link.href = url;
                link.download = "devpath-tentativa.json";
                link.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                action.disabled = false;
            });
            action.addEventListener("click", () => {
                if (state === "recovery") {
                    ctx.progressSync.continueFromAccount();
                    ctx.render();
                }
                else if (state === "paused")
                    ctx.progressSync.retry();
                else
                    location.reload();
            });
            panel.append(copy, download, action);
            ctx.view.before(panel);
        }
        function setSaveStatus(message) {
            const status = document.querySelector(".save-status");
            if (status)
                status.replaceChildren(document.createElement("i"), document.createTextNode(` ${message}`));
        }
        return Object.freeze({ showSyncIssue, setSaveStatus });
    }
    global.DevPathSyncNotifications = Object.freeze({ create });
})(window);
