(function (global) {
  "use strict";

  // Seleção pura de katas intercalados (Fase 6.3). Sem DOM e sem relógio: a aleatoriedade vem de um RNG injetável
  // (options.rng) ou de uma semente (options.seed), para que a mesma entrada produza a mesma sessão.

  const BANDS = Object.freeze(["07", "11", "14", "18"]);
  const DEFAULT_LIMIT = 5;
  const MIN_PROMPT_TITLE_LENGTH = 4;
  // Heurística simples: um verbo de instrução seguido de um artigo opcional e um token (ex.: "Use o Map", "use Object.keys").
  const METHOD_HINT = /\b(?:use|usar|utilize|utilizar|aplique|empregue)\s+(?:(?:o|a|os|as|um|uma|the)\s+)?[`'"“]?[\p{L}\p{N}_$.]+/iu;

  function createSeededRandom(seed) {
    let state = Number.isFinite(Number(seed)) ? Number(seed) >>> 0 : 0;
    return function seeded() {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function resolveRandom({ rng, seed } = {}) {
    if (typeof rng === "function") return rng;
    if (seed !== undefined && seed !== null) return createSeededRandom(seed);
    return Math.random;
  }

  function shuffled(items, random) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  const fold = text => String(text ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  function titleFor(sourceActivityId, activityTitles) {
    if (!activityTitles || !sourceActivityId) return undefined;
    return activityTitles instanceof Map ? activityTitles.get(sourceActivityId) : activityTitles[sourceActivityId];
  }

  // Rejeita o enunciado que revela a atividade de origem ou indica o método a usar.
  function validateKataPrompt(variant, options = {}) {
    const prompt = typeof variant?.prompt === "string" ? variant.prompt : "";
    if (!prompt.trim()) return { ok: false, reason: "empty-prompt" };
    const folded = fold(prompt);
    const titles = [variant.sourceTitle, titleFor(variant.sourceActivityId, options.activityTitles)];
    for (const title of titles) {
      const foldedTitle = fold(title).trim();
      if (foldedTitle.length >= MIN_PROMPT_TITLE_LENGTH && folded.includes(foldedTitle)) return { ok: false, reason: "mentions-source-activity" };
    }
    if (METHOD_HINT.test(prompt)) return { ok: false, reason: "announces-method" };
    return { ok: true };
  }

  function isEligible(variant, band, studied) {
    return Boolean(variant)
      && typeof variant.variantId === "string" && variant.variantId.length > 0
      && typeof variant.conceptId === "string" && variant.conceptId.length > 0
      && Array.isArray(variant.bands) && variant.bands.includes(band)
      // A kata practises something already learned: the source activity counts as a prerequisite too.
      && typeof variant.sourceActivityId === "string" && studied.has(variant.sourceActivityId)
      && Array.isArray(variant.prerequisites)
      && variant.prerequisites.every(id => studied.has(id));
  }

  function emptySession(band, reason, extra = {}) {
    return { kind: "empty", band, items: [], concepts: [], reason, ...extra };
  }

  // Monta uma sessão de katas para a faixa. Retorna kind: 'mixed' (>= 2 conceitos, intercalados),
  // 'simple' (um único conceito elegível) ou 'empty' (com reason).
  function selectSession({ variants = [], band, studied = [], limit = DEFAULT_LIMIT, seed, rng, activityTitles } = {}) {
    if (!BANDS.includes(band)) return emptySession(band, "invalid-band");
    if (!Number.isInteger(limit) || limit < 1) throw new RangeError("limit must be a positive integer");
    const random = resolveRandom({ rng, seed });
    const done = new Set(studied instanceof Set ? studied : Array.isArray(studied) ? studied : []);
    const seen = new Set();
    const eligible = [];
    let rejected = 0;
    for (const variant of Array.isArray(variants) ? variants : []) {
      if (!isEligible(variant, band, done) || seen.has(variant.variantId)) continue;
      seen.add(variant.variantId);
      if (validateKataPrompt(variant, { activityTitles }).ok) eligible.push(variant);
      else rejected += 1;
    }
    if (!eligible.length) return emptySession(band, rejected ? "all-eligible-rejected" : "no-eligible-variants", { rejected });

    const byConcept = new Map();
    for (const variant of eligible) {
      if (!byConcept.has(variant.conceptId)) byConcept.set(variant.conceptId, []);
      byConcept.get(variant.conceptId).push(variant);
    }
    for (const [concept, list] of byConcept) byConcept.set(concept, shuffled(list, random));
    const concepts = shuffled([...byConcept.keys()], random);

    if (concepts.length === 1) {
      const [concept] = concepts;
      return { kind: "simple", band, concept, items: byConcept.get(concept).slice(0, limit), concepts, rejected };
    }
    if (limit < 2) return emptySession(band, "limit-too-small-to-mix", { concepts, rejected });

    // Intercalação: a cada passo escolhe um conceito diferente do anterior sempre que houver outro disponível;
    // entre os disponíveis, prefere o de mais itens restantes (equilíbrio), com desempate pela ordem sorteada.
    const items = [];
    let last = null;
    while (items.length < limit) {
      const open = concepts.filter(concept => byConcept.get(concept).length > 0);
      if (!open.length) break;
      const alternatives = open.filter(concept => concept !== last);
      const pool = alternatives.length ? alternatives : open;
      let pick = pool[0];
      for (const concept of pool) if (byConcept.get(concept).length > byConcept.get(pick).length) pick = concept;
      items.push(byConcept.get(pick).shift());
      last = pick;
    }
    const mixed = [...new Set(items.map(item => item.conceptId))];
    return { kind: "mixed", band, items, concepts: mixed, rejected };
  }

  // Contagem de variantes por faixa e por conceito. Uma variante conta uma vez por faixa em que é declarada.
  function coverageByBand(variants = []) {
    const result = {};
    for (const band of BANDS) result[band] = { variants: 0, conceptCount: 0, concepts: {} };
    const seen = new Set();
    for (const variant of Array.isArray(variants) ? variants : []) {
      if (!variant || typeof variant.variantId !== "string" || typeof variant.conceptId !== "string" || !Array.isArray(variant.bands)) continue;
      if (seen.has(variant.variantId)) continue;
      seen.add(variant.variantId);
      for (const band of new Set(variant.bands)) {
        if (!result[band]) continue;
        result[band].variants += 1;
        result[band].concepts[variant.conceptId] = (result[band].concepts[variant.conceptId] || 0) + 1;
      }
    }
    for (const band of BANDS) result[band].conceptCount = Object.keys(result[band].concepts).length;
    return result;
  }

  global.DevPathKataSelector = Object.freeze({ BANDS, DEFAULT_LIMIT, selectSession, validateKataPrompt, coverageByBand, createSeededRandom });
})(globalThis);
