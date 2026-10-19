import{debounce,throttle}from'./tempo.js';test('trailing debounce resets timer and cancel clears',()=>{let now=0,j=[],o=[];const set=(fn,ms)=>{const x={fn,at:now+ms,c:false};j.push(x);return x},clear=x=>x.c=true,advance=t=>{now=t;for(const x of j.filter(x=>!x.c&&x.at<=t)){x.c=true;x.fn();}};const d=debounce(x=>o.push(x),100,{set,clear});d(1);now=20;d(2);advance(119);expect(o).toEqual([]);advance(120);expect(o).toEqual([2]);d(3);d.cancel();advance(300);expect(o).toEqual([2]);});test('throttle accepts exact boundary',()=>{let t=0,o=[];const f=throttle(x=>o.push(x),100,{now:()=>t});f(0);t=99;f(99);t=100;f(100);expect(o).toEqual([0,100]);});
test('starter com quatro eventos mantém as duas saídas esperadas',()=>{
  let now=0;const jobs=[];
  const clock={agora:()=>now,setTimeout(fn,ms){const task={at:now+ms,fn,cancelled:false};jobs.push(task);return task;},clearTimeout(task){task.cancelled=true;}};
  const advance=target=>{for(;;){const task=jobs.filter(item=>!item.cancelled&&item.at<=target).sort((a,b)=>a.at-b.at)[0];if(!task)break;task.cancelled=true;now=task.at;task.fn();}now=target;};
  const callsD=[],callsT=[];
  const d=debounce(()=>callsD.push(now),100,clock);
  const t=throttle(()=>callsT.push(now),100,{now:clock.agora});
  for(const at of [0,20,40,160]){advance(at);d();t();}
  advance(1000);
  expect(callsD).toEqual([140,260]);
  expect(callsT).toEqual([0,160]);
});
test('eventos no limite trailing e leading seguem a politica declarada',()=>{
  let now=0;const jobs=[],debounced=[],throttled=[];
  const clock={agora:()=>now,setTimeout(fn,ms){const task={at:now+ms,fn,cancelled:false};jobs.push(task);return task;},clearTimeout(task){task.cancelled=true;}};
  const d=debounce(value=>debounced.push([now,value]),100,clock);
  const t=throttle(value=>throttled.push([now,value]),100,{now:clock.agora});
  d('trailing');t('leading');now=99;t('before-boundary');now=100;t('at-boundary');
  for(const job of jobs)if(!job.cancelled&&job.at<=now){job.cancelled=true;job.fn();}
  expect(debounced).toEqual([[100,'trailing']]);
  expect(throttled).toEqual([[0,'leading'],[100,'at-boundary']]);
});
test('100 eventos usam o relogio do starter',()=>{let now=0;const tasks=[];const callsD=[],callsT=[];const clock={agora:()=>now,setTimeout(fn,ms){const task={at:now+ms,fn,cancelled:false};tasks.push(task);return task;},clearTimeout(task){task.cancelled=true;}};const d=debounce(x=>callsD.push([now,x]),100,clock),t=throttle(x=>callsT.push([now,x]),100,clock);for(let i=0;i<100;i++){now=i*10;d(i);t(i);}now=1090;for(const task of tasks)if(!task.cancelled&&task.at<=now)task.fn();expect(callsD).toEqual([[1090,99]]);expect(callsT.map(row=>row[0])).toEqual([0,100,200,300,400,500,600,700,800,900]);d(101);d.cancel();});
