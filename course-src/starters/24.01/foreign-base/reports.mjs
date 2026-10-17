const reports = [{id: 'r-1', ownerId: 'ana', body: 'relatório de Ana'}];
export function findReport(id) { return reports.find(report => report.id === id) ?? null; }
export function getReport(id, userId) {
  const report = findReport(id);
  if (!report) return {status: 404};
  return {status: 200, report};
}
