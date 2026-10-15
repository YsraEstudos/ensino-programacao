(function (global) {
    "use strict";
    // Injected dependencies: breadcrumb, curriculumActivities, dueExercises, esc.
    function create(ctx) {
        function routeInfo() {
            const path = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
            if (path[0] === "javascript" && path[1] && ctx.curriculumActivities.some((item) => item.id === path[1]))
                return { name: "javascript", id: path[1] };
            if (path[0] === "javascript")
                return { name: "javascript" };
            if (["catalog", "review"].includes(path[0]))
                return { name: path[0] };
            if (path[0] === "katas")
                return { name: "katas", band: /^\d{2}$/.test(path[1] || "") ? path[1] : null };
            return { name: "home" };
        }
        function setBreadcrumb(...parts) {
            const hrefFor = (part) => {
                if (part === "Seu espaço" || part === "Início")
                    return "#/home";
                if (part === "JavaScript" || part === "Exercícios")
                    return "#/catalog";
                if (part === "Diagnóstico")
                    return "#/javascript/D.01";
                if (part === "Revisão")
                    return "#/review";
                if (part === "Katas")
                    return "#/katas";
                if (part === "Etapa 03")
                    return "#/javascript/03.04";
                const stage = /^Etapa (\d{2})$/.exec(part);
                return stage ? `#/javascript/${stage[1]}.01` : null;
            };
            const home = `<a
        class="breadcrumb-home"
        href="#/home">Seu espaço</a>`;
            const trail = parts.map((part, index) => {
                const href = hrefFor(part);
                const content = index === parts.length - 1
                    ? `<strong
        aria-current="page">${ctx.esc(part)}</strong>`
                    : href ? `<a
        href="${href}">${ctx.esc(part)}</a>` : `<span>${ctx.esc(part)}</span>`;
                return `<span
        class="crumb-sep"
        aria-hidden="true">/</span>${content}`;
            }).join("");
            ctx.breadcrumb.innerHTML = home + trail;
        }
        function updateNav(route) {
            const section = route === "javascript" ? "catalog" : route === "katas" ? "review" : route;
            document.querySelectorAll("[data-nav]").forEach((item) => item.classList.toggle("active", item.dataset.nav === section));
            const dueCount = ctx.dueExercises().length;
            document.querySelector("#review-count").textContent = dueCount ? String(dueCount) : "↗";
        }
        let stop;
        function dispose() { stop?.(); stop = null; }
        function start(callback) {
            dispose();
            const link = document.querySelector('.skip-link');
            const focusContent = event => { event.preventDefault(); document.querySelector('#main')?.focus({ preventScroll: false }); };
            link?.addEventListener('click', focusContent);
            window.addEventListener("hashchange", callback);
            stop = () => { window.removeEventListener("hashchange", callback); link?.removeEventListener('click', focusContent); };
            return dispose;
        }
        return Object.freeze({ routeInfo, setBreadcrumb, updateNav, start, dispose });
    }
    global.DevPathAppRouter = Object.freeze({ create });
})(window);
