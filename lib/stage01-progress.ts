export type Stage01Transfer = {
  id: string; code: string; prediction: string; passedCode: string | null; hintUsed: boolean;
};
export type Stage01State = {
  version: 3; code: string; predictions: string[]; predictionSaved: boolean;
  reflection: string; passedCode: string | null; complete: boolean; hintLevel: number;
  order: string[]; secondOrder: string; transfers: Stage01Transfer[]; fontSize: number;
};
const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const text = (value: unknown, limit: number) => typeof value === 'string' ? value.slice(0,limit) : '';
const count = (value: unknown, min: number, max: number, fallback = min) => Math.max(min,Math.min(max,Math.trunc(Number(value)||fallback)));
export function sanitizeStage01Progress(input: unknown): Record<string, Stage01State> {
  const clean: Record<string, Stage01State> = {};
  const states = object(input);
  for (let number=1; number<=9; number++) {
    const id=`01.${String(number).padStart(2,'0')}`, state=object(states[id]);
    if (state.version !== 3) continue;
    const code=text(state.code,12000);
    const predictions=Array.isArray(state.predictions) ? state.predictions.slice(0,12).map(value=>text(value,400)) : [];
    const predictionSaved=state.predictionSaved===true && predictions.length>0 && predictions.every(value=>value.trim().length>0);
    const reflection=text(state.reflection,1200);
    const passedCode=typeof state.passedCode==='string' && state.passedCode===code && code.trim() ? code : null;
    const transfers: Stage01Transfer[]=Array.isArray(state.transfers) ? state.transfers.slice(0,2).map(value=>{
      const entry=object(value), transferCode=text(entry.code,12000);
      return {id:text(entry.id,30),code:transferCode,prediction:text(entry.prediction,1200),passedCode:typeof entry.passedCode==='string' && entry.passedCode===transferCode && transferCode.trim()?transferCode:null,hintUsed:entry.hintUsed===true};
    }).filter(entry=>['config','duration'].includes(entry.id)) : [];
    const mastery=number!==9 || ['config','duration'].every(key=>transfers.some(entry=>entry.id===key && entry.passedCode===entry.code && entry.passedCode!==null && entry.prediction.trim() && !entry.hintUsed));
    clean[id]={version:3,code,predictions,predictionSaved,reflection,passedCode,
      complete:state.complete===true && predictionSaved && passedCode!==null && reflection.trim().length>=16 && mastery,
      hintLevel:count(state.hintLevel,0,3),order:Array.isArray(state.order)?state.order.filter((letter):letter is string=>typeof letter==='string' && /^[A-E]$/.test(letter)).slice(0,5):[],
      secondOrder:text(state.secondOrder,80),transfers,fontSize:count(state.fontSize,14,22,16)};
  }
  return clean;
}
