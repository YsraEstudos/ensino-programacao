export function pipeline(source) {
  const operators=[];
  const api={map(fn){operators.push({kind:"map",fn});return api;},filter(fn){operators.push({kind:"filter",fn});return api;},take(count){operators.push({kind:"take",count});return api;},[Symbol.iterator](){let iterator=source[Symbol.iterator]();let taken=0;const limit=operators.find(op=>op.kind==="take");return {next(){if(limit&&taken>=limit.count){iterator.return?.();return {done:true,value:undefined};}while(true){const item=iterator.next();if(item.done)return item;let value=item.value,skip=false;for(const op of operators){if(op.kind==="map")value=op.fn(value);else if(op.kind==="filter"&&!op.fn(value)){skip=true;break;}}if(skip)continue;taken++;return {done:false,value};}}};}};return api;
}
