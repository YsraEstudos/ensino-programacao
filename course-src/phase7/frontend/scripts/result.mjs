export function classify(result,minimumPassed=1){
  if(result.error||result.signal||result.status===null)return 'runner-error';
  const lines=String(result.stdout||'').split('\n').filter(line=>line.startsWith('PHASE7_RESULT:'));
  if(lines.length!==1)return 'unrecognized-error';
  let report;try{report=JSON.parse(lines[0].slice('PHASE7_RESULT:'.length));}catch{return 'unrecognized-error';}
  if(report.skipped||!Array.isArray(report.failures))return 'incomplete';
  if(result.status===0&&report.passed>=minimumPassed&&!report.failures.length)return 'passed';
  if(result.status===1&&report.failures.length&&report.failures.every(error=>error.code==='ERR_ASSERTION'||error.causeCode==='ERR_ASSERTION'))return 'assertion-failure';
  return 'environment-or-contract-error';
}
