export function somaComReduce(xs){return xs.reduce((a,b)=>a+b,0)}export function somaComFor(xs){let s=0;for(const x of xs)s+=x;return s}export function medir(fn,input,{runs=5,warmups=1,now=()=>performance.now()}={}){if(!Array.isArray(input)||input.some(x=>!Number.isFinite(x)))throw new TypeError('finite numbers required');for(let i=0;i<warmups;i++)fn(input);const samples=[];for(let i=0;i<runs;i++){const t=now();fn(input);samples.push(now()-t)}const s=[...samples].sort((a,b)=>a-b);return{samples,median:s.length%2?s[Math.floor(s.length/2)]:(s[s.length/2-1]+s[s.length/2])/2,min:Math.min(...s),max:Math.max(...s),memory:performance.memory?.usedJSHeapSize??null}}

export function comparar(input) {
  if (!Array.isArray(input) || input.length === 0 || input.some(x => !Number.isFinite(x))) return {erro:'Entrada inválida: use números finitos.'};
  const a = somaComReduce(input), b = somaComFor(input);
  if (a !== b) return {erro:'Resultados diferentes.'};
  return {resultado:a, reduce:medir(somaComReduce,input), for:medir(somaComFor,input), memory:globalThis.performance?.memory?.usedJSHeapSize??null};
}
export function montarLaboratorio(documentRef=globalThis.document){
  if(!documentRef)return;
  const input=documentRef.querySelector('#tamanho'),button=documentRef.querySelector('#medir'),status=documentRef.querySelector('#mensagem'),body=documentRef.querySelector('#resultados'),memory=documentRef.querySelector('#memoria'),environment=documentRef.querySelector('#ambiente');
  if(!input||!button||!status||!body||!memory||!environment)return;
  environment.textContent=globalThis.navigator?.userAgent??'desconhecido';
  button.addEventListener('click',()=>{
    const size=Number(input.value);
    if(input.value.trim()===''||!Number.isInteger(size)||size<1||size>200000){status.textContent='Informe um inteiro entre 1 e 200000.';body.textContent='';return;}
    button.disabled=true;status.textContent='Medindo as duas implementações…';
    const report=comparar(Array.from({length:size},(_,i)=>i%10));
    if(report.erro){status.textContent=report.erro;body.textContent='';button.disabled=false;return;}
    body.textContent='';
    for(const [name,result] of [['reduce',report.reduce],['for',report.for]]){
      const row=documentRef.createElement('tr');
      for(const value of [name,result.median.toFixed(3),result.min.toFixed(3),result.max.toFixed(3),result.samples.map(n=>n.toFixed(3)).join(', ')]){const cell=documentRef.createElement('td');cell.textContent=String(value);row.append(cell);}
      body.append(row);
    }
    memory.textContent=typeof report.memory==='number'?`${(report.memory/1024/1024).toFixed(1)} MB`:'N/D';
    status.textContent=`Resultado ${report.resultado}; compare a dispersão antes de concluir qual é mais rápido.`;button.disabled=false;
  });
}
if(globalThis.document)montarLaboratorio();
