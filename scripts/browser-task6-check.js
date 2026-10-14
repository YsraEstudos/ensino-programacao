// Real Chromium gate for Task 6. Run this callback through the Playwright
// connector after the local server is ready; Node/jsdom cannot prove these
// iframe, CSP, focus, storage, or Worker properties.
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
async (page) => {
  const p = await page.context().newPage();
  try {
    await p.goto('http://127.0.0.1:8017/devpath.html#/catalog');
    await p.waitForFunction(() => window.DevPathDomRunner && window.DevPathModuleGraph && window.DevPathWorkerPreview && window.DevPathAssessment);
    const result = await p.evaluate(async () => {
      const run = (spec, options) => DevPathDomRunner.run(spec, options);
      const domFiles = [
        {path: 'index.html', content: '<main><form id="form"><label for="query">Consulta</label><input id="query" name="query"><button type="submit">Enviar</button></form><div id="root"></div><p id="status" aria-live="polite"></p></main>'},
        {path: 'style.css', content: '#status { color: red; }'},
        {path: 'main.js', content: `export function mount() { const root=document.querySelector('#root'); root.replaceChildren(); const button=document.createElement('button'); button.type='button'; button.textContent='Adicionar'; const list=document.createElement('ul'); button.addEventListener('click',()=>{ const item=document.createElement('li'); item.textContent='<img src=x onerror=alert(1)>'; list.append(item); }); root.append(button,list); document.querySelector('#form').addEventListener('submit',event=>{ event.preventDefault(); document.querySelector('#status').textContent='enviado'; }); return root; } export function save(value) { localStorage.setItem('task6', value); }`},
      ];
      const domTest = `import {mount,save} from './main.js'; test('render, event, form and isolated storage',()=>{ mount(); mount(); expect(document.querySelectorAll('#root > button').length).toBe(1); document.querySelector('#root > button').click(); expect(document.querySelector('li').textContent).toBe('<img src=x onerror=alert(1)>'); expect(document.querySelector('li img')).toBe(null); document.querySelector('#form').requestSubmit(); expect(document.querySelector('#status').textContent).toBe('enviado'); expect(getComputedStyle(document.querySelector('#status')).color).toBe('rgb(255, 0, 0)'); save('first'); expect(localStorage.getItem('task6')).toBe('first'); });`;
      const first = await run({files: domFiles, entryPath: 'index.html', testCode: domTest, fixtures: {interactive: true}}, {interactive: true});
      const second = await run({files: domFiles, entryPath: 'index.html', testCode: `import {mount} from './main.js'; test('storage resets',()=>{ mount(); expect(localStorage.getItem('task6')).toBe(null); });`});
      const empty = await run({files: [{path: 'main.js', content: 'export const marker = 1;'}], entryPath: 'main.js', testCode: 'const marker = 1;'});
      const network = await run({files: [
        {path: 'main.js', content: 'export async function load(){const [a,b]=await Promise.all([fetch("/a"),fetch("/b")]);return [await a.text(),await b.json(),a.status,b.status];}'},
      ], entryPath: 'main.js', testCode: `import {load} from './main.js'; test('out of order local responses',async()=>{ const value=await load(); expect(value).toEqual(['A',{ok:true},404,200]); });`, fixtures: {network: [{method:'GET',url:'/a',delay:35,status:404,body:'A'},{method:'GET',url:'/b',delay:5,status:200,body:{ok:true}}]}});
      const worker = await run({files: [
        {path: 'main.js', content: 'export function calculate(n){return new Promise((resolve,reject)=>{const worker=new Worker(new URL("./worker.js",import.meta.url),{type:"module"});worker.onmessage=e=>{worker.terminate();resolve(e.data.result)};worker.onerror=e=>{worker.terminate();reject(e.error||new Error(e.message))};worker.postMessage({n})});}'},
        {path: 'worker.js', content: 'import {inc} from "./primos.js"; self.onmessage=e=>self.postMessage({result:inc(e.data.n)});'},
        {path: 'primos.js', content: 'export const inc=n=>n+1;'},
      ], entryPath: 'main.js', testCode: `import {calculate} from './main.js'; test('local worker module',async()=>{ expect(await calculate(10)).toBe(11); });`, fixtures: {workerEntries: ['worker.js']}});
      const workerError = await run({files: [
        {path: 'main.js', content: 'export function calculate(){return new Promise((resolve,reject)=>{const worker=new Worker(new URL("./worker.js",import.meta.url),{type:"module"});worker.onmessage=e=>resolve(e.data);worker.onerror=e=>{worker.terminate();reject(new Error(e.message||"worker error"))};worker.postMessage({})});}'},
        {path: 'worker.js', content: 'throw new Error("worker-broken");'},
      ], entryPath: 'main.js', testCode: `import {calculate} from './main.js'; test('worker errors settle',async()=>{ await expect(calculate()).rejects.toThrow(/worker-broken|worker error/); });`, fixtures: {workerEntries: ['worker.js']}});
      const mutation = await DevPathAssessment.run({item: {id: 'task6-dom', contentVersion: 1}, assessment: {environment: 'dom', version: 1, checks: ['mutation'], entryPath: 'main.js', testPaths: ['tests/ui.test.js'], correctFiles: [{path: 'main.js', content: 'export function render(node,value){node.textContent=value;}'}], mutantDirs: [{id: 'unsafe-html', files: [{path: 'main.js', content: 'export function render(node,value){node.innerHTML=value;}'}]}]}, files: [{path: 'main.js', content: 'export function render(node,value){node.textContent=value;}'}, {path: 'helpers/assertions.js', content: 'export const same = (a,b)=>a===b;'}, {path: 'tests/ui.test.js', content: 'import {render} from "../main.js"; import {same} from "../helpers/assertions.js"; test("safe render",()=>{const node=document.createElement("div"); const literal="<img src=x onerror=alert(1)>"; render(node,literal); expect(same(node.textContent,literal)).toBe(true); expect(node.querySelector("img")).toBe(null);});'}]}, {fingerprint: 'task6'});
      return {first, second, empty, network, worker, workerError, mutation, iframes: document.querySelectorAll('iframe').length};
    });
    if (result.first.kind !== 'passed' || result.second.kind !== 'passed' || result.empty.kind !== 'failed' || result.network.kind !== 'passed' || result.worker.kind !== 'passed' || result.workerError.kind !== 'passed' || result.mutation.kind !== 'passed' || result.iframes !== 0)
      throw Error(JSON.stringify(result));
    return result;
  } finally { await p.close(); }
}
