// Native node:assert assertions have explicit identity. Locator/runner timeouts are errors.
export default class BrowserReporter{
  report={passed:0,skipped:0,failures:[]};
  onStdOut(chunk){process.stdout.write(chunk);}
  onTestEnd(test,result){
    if(result.status==='passed')this.report.passed++;
    else if(result.status==='skipped')this.report.skipped++;
    else for(const error of result.errors.length?result.errors:[{message:result.status}]){
      const message=String(error.message||error.value||'').replace(/\x1b\[[0-9;]*m/g,'');
      const assertion=result.status==='failed'&&/PHASE7_ASSERTION\[ERR_ASSERTION\]/.test(message)&&!/timed? ?out|TimeoutError|ERR_MODULE_NOT_FOUND|ENOENT|EACCES|EPERM|browserType\.launch/i.test(message);
      this.report.failures.push({code:assertion?'ERR_ASSERTION':'BROWSER_OR_CONTRACT_ERROR',message});
    }
  }
  onError(error){this.report.failures.push({code:'RUNNER_ERROR',message:error.message});}
  onEnd(){console.log('PHASE7_RESULT:'+JSON.stringify(this.report));}
}
