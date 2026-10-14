type Payloads={open:{id:string};close:undefined;error:{message:string}}; type EventName=keyof Payloads; type HandlerMap={[K in EventName]:(payload:Payloads[K])=>void};
export const handlers:HandlerMap={open:payload=>console.log("abriu",payload.id),close:()=>console.log("fechou"),error:payload=>console.log("erro",payload.message)};
export function handle<K extends EventName>(nome:K,payload:Payloads[K]):void { handlers[nome](payload as never); }
