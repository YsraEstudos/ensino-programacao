import{parse}from'./parser.js';const valid=parse('2');if(valid.ok){valid.value.toFixed();
// @ts-expect-error success result has no error
valid.error;}const invalid=parse('x');if(!invalid.ok)invalid.error.toUpperCase();
// @ts-expect-error invalid result has no value
invalid.value;
