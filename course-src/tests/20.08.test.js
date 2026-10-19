import {pipeline} from "./pipeline.js";
function* tracked(limit, pulls, closed){try{for(let i=1;i<=limit;i++){pulls.count++;yield i;}}finally{closed.value=true;}}
test("lazy map/filter/take puxa só até resultados aceitos",()=>{const pulls={count:0},closed={value:false};const values=[...pipeline(tracked(10,pulls,closed)).map(x=>x*2).filter(x=>x>3).take(2)];expect(values).toEqual([4,6]);expect(pulls.count).toBe(3);expect(closed.value).toBe(true);});
test("take zero não consome e a pipeline pode ser iterada de novo",()=>{const pulls={count:0},closed={value:false};const source=tracked(10,pulls,closed);const p=pipeline(source).map(x=>x).take(0);expect([...p]).toEqual([]);expect(pulls.count).toBe(0);const finite=pipeline([1,2,3]).filter(x=>x>1).take(1);expect([...finite]).toEqual([2]);expect([...finite]).toEqual([2]);});
test('iterável reiniciável, generator consumível e fábrica explícita',()=>{
  const values=pipeline([1,2]);
  expect([...values]).toEqual([1,2]);
  expect([...values]).toEqual([1,2]);
  function* generate(){yield 1;yield 2;}
  const oneShot=pipeline(generate());
  expect([...oneShot]).toEqual([1,2]);
  expect([...oneShot]).toEqual([]);
  let creations=0;
  const makeSource=()=>{creations++;return generate();};
  expect([...pipeline(makeSource())]).toEqual([1,2]);
  expect([...pipeline(makeSource())]).toEqual([1,2]);
  expect(creations).toBe(2);
});
test('take fecha a fonte e não faz pull após a quantidade aceita',()=>{
  const trace=[];
  function* source(){try{for(let value=1;value<=3;value++){trace.push('pull:'+value);yield value;}}finally{trace.push('return');}}
  expect([...pipeline(source()).take(2)]).toEqual([1,2]);
  expect(trace).toEqual(['pull:1','pull:2','return']);
});
test('take posicional e ramos independentes',()=>{const base=pipeline([1,2,3,4]);expect([...base.take(2).map(x=>x*10)]).toEqual([10,20]);expect([...base.filter(x=>x%2===0).take(2)]).toEqual([2,4]);expect([...base]).toEqual([1,2,3,4]);});
test('break fecha a fonte',()=>{let closed=false;function* input(){try{yield 1;yield 2;}finally{closed=true;}}for(const value of pipeline(input()).map(x=>x).filter(Boolean))break;expect(closed).toBe(true);});
test('array reinicia, mesma instância generator pode estar consumida, fábrica cria nova instância',()=>{const array=pipeline([1,2]);expect([...array]).toEqual([1,2]);expect([...array]).toEqual([1,2]);function* items(){yield 1;yield 2;}const instance=pipeline(items());expect([...instance]).toEqual([1,2]);expect([...instance]).toEqual([]);const makeItems=()=>items();expect([...pipeline(makeItems())]).toEqual([1,2]);expect([...pipeline(makeItems())]).toEqual([1,2]);});
test('take fecha com return sem pull extra depois do limite',()=>{const trace=[];function* input(){try{for(let n=1;n<=3;n++){trace.push('pull:'+n);yield n;}}finally{trace.push('return');}}expect([...pipeline(input()).take(2)]).toEqual([1,2]);expect(trace).toEqual(['pull:1','pull:2','return']);});
