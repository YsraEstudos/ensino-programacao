(function (global) {
    'use strict';
    function stage01(id, state) {
        if (id !== '01.04' || typeof state?.code !== 'string' || state.code.includes('\n'))
            return { state, changed: false };
        const shape = state.code.replace(/\b(?:const|let|___)(?=\s+(?:nome|pontos|ativo|volume|idioma|tentativas)\b)/g, '___').replace(/\s/g, '');
        if (shape !== '___nome="Ana";___pontos=0;pontos=5;___ativo=false;___volume=0;volume=7;___idioma="pt-BR";___tentativas=1;tentativas=2;')
            return { state, changed: false };
        return { changed: true, state: { ...state, code: state.code + '\nconsole.log(nome, pontos, ativo, volume, idioma, tentativas);', passedCode: null, complete: false } };
    }
    function migrateLegacyLearning(progress, catalog, assessments) {
        return global.DevPathLearningProgress.migrateLegacyLearning(progress, catalog, assessments);
    }
    global.DevPathProgressMigrations = Object.freeze({ stage01, migrateLegacyLearning });
})(globalThis);
