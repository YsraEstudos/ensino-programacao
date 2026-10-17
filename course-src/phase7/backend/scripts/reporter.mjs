// Machine-readable failure kinds: an assertion is never inferred from arbitrary stderr.
export default async function* reporter(events) {
  const report = {passed: 0, skipped: 0, failures: []};
  for await (const {type, data} of events) {
    if (type === 'test:pass') { report.passed++; if (data.skip) report.skipped++; }
    if (type === 'test:fail') {
      const error = data.details?.error;
      report.failures.push({name: data.name, code: error?.code, causeCode: error?.cause?.code, message: error?.message, cause: error?.cause?.message});
    }
    if (type === 'test:stderr') yield data.message;
  }
  yield '\nPHASE7_RESULT:' + JSON.stringify(report) + '\n';
}
