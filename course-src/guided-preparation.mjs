// Derives the Stage 01-style teaching scaffold (concept steps, glossary, worked
// example, hints, docs) for stages 04-23 from the fields each activity already
// publishes. Nothing here invents new facts: every sentence comes from the
// activity's own explanation, prompt, examples, rubric or resources.

export const guidedStageTitles = {
  '04': 'FUNÇÕES, RETORNO E ERROS',
  '05': 'TEXTO, ARRAYS E REGEX',
  '06': 'OBJETOS E REFERÊNCIAS',
  '07': 'CALLBACKS E COLEÇÕES',
  '08': 'COMPLEXIDADE E RECURSÃO',
  '09': 'ESCOPO E CLOSURES',
  '10': 'THIS, PROTÓTIPOS E CLASSES',
  '11': 'DOM, EVENTOS E FORMULÁRIOS',
  '12': 'HTTP, PROMISES E TEMPO',
  '13': 'ERROS, DEPURAÇÃO E TESTES',
  '14': 'MÓDULOS, NODE E FERRAMENTAS',
  '15': 'TYPESCRIPT: FUNDAMENTOS',
  '16': 'UNIÕES E NARROWING',
  '17': 'GENERICS E OVERLOADS',
  '18': 'KEYOF E UTILITY TYPES',
  '19': 'TIPOS AVANÇADOS',
  '20': 'ITERADORES, PROXY E STREAMS',
  '21': 'PERFORMANCE E MEMÓRIA',
  '22': 'PACOTES, .D.TS E SCHEMAS',
  '23': 'ARQUITETURA E CAPSTONE',
};

const clean = text => String(text ?? '').replace(/\s+/g, ' ').trim();
function sentences(text) {
  const value = clean(text), out = [];
  let start = 0, inlineCode = false;
  for (let index = 0; index < value.length; index++) {
    if (value[index] === '`' && value[index - 1] !== '\\') inlineCode = !inlineCode;
    if (!inlineCode && /[.!?]/.test(value[index]) && /^\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ`"'(\[])/.test(value.slice(index + 1))) {
      out.push(value.slice(start, index + 1).trim());
      start = index + 1;
    }
  }
  const tail = value.slice(start).trim();
  if (tail) out.push(tail);
  return out;
}
const first = text => sentences(text)[0] || '';
const unique = values => [...new Set(values)];

function vocabulary(item) {
  const e = item.explanation;
  const pool = sentences([e.mental_model, e.worked_example, e.common_trap, e.why_it_matters].join(' '));
  const terms = unique([...[e.mental_model, e.worked_example, e.common_trap, item.prompt]
    .join(' ').matchAll(/`([^`\n]{2,40})`/g)].map(m => m[1]).filter(term => /^[A-Za-z_$][\w$.]*(\(\))?$/.test(term)));
  return terms.slice(0, 6).flatMap(term => {
    const sentence = pool.find(s => s.includes(`\`${term}\``));
    return sentence ? [`\`${term}\` — ${sentence}`] : [];
  });
}

// Several documentation links may share one resource line separated by " ; ".
// Split them first, so no link is cut at its own separator.
const splitDocLinks = resource => String(resource ?? '').split(/\s;\s(?=[^:;]+:\s*https:\/\/)/);

function docsFrom(resources) {
  const docs = [], materials = [];
  for (const resource of resources.flatMap(splitDocLinks)) {
    const match = /^(.*?):\s*(https:\/\/[^\s<>]+?)\.?(?:\s+(.*))?$/s.exec(resource);
    if (!match) { materials.push(clean(resource)); continue; }
    const rest = clean(match[3]).replace(/^Seção:\s*/, '');
    const section = /^([^.]+)\.\s*(.*)$/.exec(rest);
    docs.push({title: clean(match[1]), url: match[2].replace(/[),.;]+$/, ''),
      section: section ? section[1] : '', question: section ? section[2] : rest});
  }
  return {docs, materials};
}

// Whole sentences up to `max` characters; never cut inside a word or sentence.
// A first sentence longer than `max` is kept whole.
function excerpt(text, max = 240) {
  const parts = sentences(text);
  let out = parts[0] || '';
  for (const part of parts.slice(1)) {
    if (`${out} ${part}`.length > max) break;
    out = `${out} ${part}`;
  }
  return out;
}

function hintsFor(item) {
  const e = item.explanation, example = item.examples?.[0];
  const out = [`Releia o enunciado e separe entrada, saída e restrições: ${excerpt(item.prompt)}`];
  out.push(example?.given
    ? `Compare com o exemplo público — dado: ${clean(example.given)}. Esperado: ${clean(example.expected)}.`
    : `Volte ao modelo mental: ${first(e.mental_model)}`);
  out.push(`Cuidado com a armadilha desta atividade: ${first(e.common_trap)}`);
  return out.filter(hint => hint.length > 12);
}

const sameText = (a, b) => clean(a).toLowerCase() === clean(b).toLowerCase();

// The first response must be a concrete action, not a restatement of the objective.
// Uses the activity's own first imperative step, then its first concept step; never empty.
export function distinctFirstAction(item) {
  const current = clean(item.firstResponse?.action);
  if (current && !sameText(current, item.objective)) return current;
  const candidates = [
    ...sentences(item.prompt).slice(0, 3),
    ...sentences(item.explanation?.mental_model).slice(0, 3),
  ].map(clean).filter(text => text.length > 12 && !sameText(text, item.objective));
  return candidates[0] || current || 'Leia a tarefa e registre sua primeira hipótese antes de executar.';
}

export function guidedPreparation(item) {
  const e = item.explanation;
  const {docs, materials} = docsFrom(item.resources || []);
  const steps = unique([...sentences(e.mental_model).slice(0, 3), ...sentences(e.why_it_matters).slice(0, 1)]);
  const practice = unique([...sentences(item.prompt).slice(0, 3), ...(item.constraints || []).slice(0, 2).map(c => `Restrição: ${clean(c)}`)]);
  return {
    guided: true,
    stageTitle: guidedStageTitles[item.stage] || `ETAPA ${item.stage}`,
    introduction: clean(item.objective || item.firstResponse?.action),
    explanation: clean(e.mental_model),
    conceptSteps: steps,
    vocabulary: vocabulary(item),
    workedExample: {steps: sentences(e.worked_example)},
    notes: [clean(e.common_trap), clean(e.why_it_matters)].filter(Boolean),
    docs,
    materials,
    predictionGuide: `${clean(item.firstResponse?.action)} ${clean(item.firstResponse?.timing)}`.trim(),
    practiceSteps: practice,
    hints: hintsFor(item),
    reflectionPrompt: 'Compare sua primeira resposta com o resultado da tentativa. Explique a regra que você praticou e um erro que ela ajuda a evitar.',
  };
}
