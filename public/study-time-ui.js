(function (global) {
    'use strict';
    function create({counter, root, getActivity, window: win = global}) {
        root.innerHTML = '<details class="study-time-panel"><summary>Tempo de estudo</summary><label><input type="checkbox" data-study-time-consent> Medir meu tempo com foco nesta atividade</label><p>Guardamos o estado do consentimento, o ID da atividade e o tempo neste navegador. A medição pausa quando a aba fica oculta ou sem foco. Desligar apaga estes registros locais.</p><p data-study-time-measured></p><p data-study-time-status role="status" aria-live="polite"></p></details>';
        const input = root.querySelector('[data-study-time-consent]');
        const measured = root.querySelector('[data-study-time-measured]');
        const status = root.querySelector('[data-study-time-status]');
        const listeners = [];
        const presence = () => ({visible: win.document.visibilityState === 'visible', focused: win.document.hasFocus()});
        let disposed = false, stored = true, ticks = 0;
        function refresh() {
            if (disposed) return;
            const state = counter.snapshot();
            const item = getActivity?.();
            input.checked = state.consent;
            const milliseconds = item ? state.activities[item.id]?.milliseconds || 0 : 0;
            measured.textContent = item
                ? `${item.id} · Tempo com foco: ${Math.floor(milliseconds / 1000)} s · Estimativa guiada: ${item.duration || 'não cadastrada'}`
                : 'Abra uma atividade para comparar tempo com foco e estimativa guiada.';
            const current = presence();
            const nextStatus = !stored
                ? state.consent ? 'Não foi possível salvar no navegador; o tempo está disponível nesta sessão.' : 'A medição parou nesta sessão, mas não foi possível atualizar os registros locais.'
                : !state.consent ? 'Medição desligada.'
                : !item ? 'Medição aguardando uma atividade.'
                : !current.visible || !current.focused ? 'Medição pausada: a aba está oculta ou sem foco.'
                : 'Medindo tempo com foco; este tempo não comprova aprendizado.';
            if (status.textContent !== nextStatus) status.textContent = nextStatus;
        }
        function routeChanged() {
            stored = counter.activity(getActivity?.()?.id || null);
            stored = counter.presence(presence()) && stored;
            refresh();
        }
        function presenceChanged() {stored = counter.presence(presence()); refresh();}
        function listen(target, name, callback) {target.addEventListener(name, callback); listeners.push([target, name, callback]);}
        listen(input, 'change', () => {stored = counter.consent(input.checked); refresh();});
        listen(win, 'hashchange', routeChanged);
        listen(win, 'focus', presenceChanged);
        listen(win, 'blur', presenceChanged);
        listen(win.document, 'visibilitychange', presenceChanged);
        listen(win, 'pagehide', () => {stored = counter.presence({visible: false, focused: false}); refresh();});
        listen(win, 'pageshow', routeChanged);
        listen(win, 'storage', event => {
            if (event.key !== null && event.key !== 'devpath-study-time-v1') return;
            let remote;
            try {remote = JSON.parse(event.newValue || 'null');} catch {remote = null;}
            // A normal remote write must not be echoed; the periodic flush merges pending totals.
            if (remote?.version === 1 && remote?.consent === true) return;
            // flush notices revocation in the shared store and discards this tab's pending intervals.
            stored = counter.flush(); refresh();
        });
        const interval = win.setInterval(() => {if (++ticks % 5 === 0) stored = counter.flush(); refresh();}, 1000);
        routeChanged();
        function dispose() {
            if (disposed) return;
            counter.presence({visible: false, focused: false});
            disposed = true;
            win.clearInterval(interval);
            for (const [target, name, callback] of listeners) target.removeEventListener(name, callback);
        }
        return Object.freeze({refresh, routeChanged, dispose});
    }
    global.DevPathStudyTimeUI = Object.freeze({create});
})(globalThis);
