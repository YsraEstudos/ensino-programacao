import { courseExerciseIds } from "./course-exercise-ids";
import { limits } from "./progress-contract.json";
import { record, text, boundedInteger } from "./progress-values";

export type Stage02Block = {
  code: string;
  prediction: string;
  predictionSaved: boolean;
  understood: boolean;
  passedCode: string | null;
  hintLevel: number;
  parsons: string[];
};
export type Stage02State = {
  version: 1;
  index: number;
  complete: boolean;
  reflection: string;
  blocks: Stage02Block[];
};

function sanitizeBlock(value: unknown): Stage02Block {
  const block = record(value);
  const code = text(block.code, limits.codeChars);
  return {
    code,
    prediction: text(block.prediction, limits.stage02PredictionChars),
    predictionSaved: block.predictionSaved === true,
    understood: block.understood === true,
    passedCode: typeof block.passedCode === "string" && block.passedCode === code && code.trim() ? code : null,
    hintLevel: boundedInteger(block.hintLevel, 0, limits.hintLevel),
    parsons: Array.isArray(block.parsons)
      ? [...new Set(block.parsons.filter((letter): letter is string => typeof letter === "string" && /^[A-E]$/.test(letter)))].slice(0, limits.parsonsLetters)
      : ["C", "D", "A", "E", "B"]
  };
}

export function sanitizeStage02Progress(value: unknown): Record<string, Stage02State> {
  const states = record(value);
  const clean: Record<string, Stage02State> = {};
  for (const id of courseExerciseIds.filter(id => id.startsWith("02."))) {
    const state = record(states[id]);
    if (state.version !== 1 || !Array.isArray(state.blocks) || !state.blocks.length || state.blocks.length > limits.stage02Blocks) continue;
    const blocks = state.blocks.map(sanitizeBlock);
    clean[id] = {
      version: 1,
      index: boundedInteger(state.index, 0, blocks.length - 1),
      complete: state.complete === true && blocks.every(block => block.predictionSaved && block.understood && block.passedCode !== null),
      reflection: text(state.reflection, limits.reflectionChars),
      blocks
    };
  }
  return clean;
}
