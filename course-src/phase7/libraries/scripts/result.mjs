export function classify(result,minimumPassed=1){
  if(result.error||result.signal||result.status===null)return 'runner-error';
  const lines=String(result.stdout||'').split('\n').filter(line=>line.startsWith('PHASE7_RESULT:'));
  if(lines.length!==1)return 'unrecognized-error';
  let report;try{report=JSON.parse(lines[0].slice(14));}catch{return 'unrecognized-error';}
  if(!Number.isInteger(report.passed)||report.passed<0||!Number.isInteger(report.skipped)||report.skipped<0||!Array.isArray(report.failures))return 'unrecognized-error';
  if(report.skipped)return 'incomplete';
  if(result.status===0&&report.passed>=minimumPassed&&!report.failures.length)return 'passed';
  if(result.status===1&&report.failures.length&&report.failures.every(f=>(f.code==='ERR_ASSERTION'||f.causeCode==='ERR_ASSERTION')&&!/ARTIFACT_OR_RUNNER_ERROR|TS\d+|ERR_MODULE_NOT_FOUND|SyntaxError|ETIMEDOUT|ENOENT|EACCES/.test(f.message||'')))return 'assertion-failure';
  return 'environment-or-contract-error';
}
