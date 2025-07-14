// process-semgrep-results.js
const fs = require('fs');
const path = require('path');
const { logSecurityScan } = require('./security-events');

const RESULTS_FILE = path.resolve('semgrep-results.json');

function getSeverityCounts(results) {
  const severityCounts = { high: 0, medium: 0, low: 0 };
  if (!results || !Array.isArray(results.results)) return severityCounts;
  for (const finding of results.results) {
    const sev = (finding.extra && finding.extra.severity) ? finding.extra.severity.toLowerCase() : 'low';
    if (severityCounts[sev] !== undefined) severityCounts[sev]++;
  }
  return severityCounts;
}

async function main() {
  if (!fs.existsSync(RESULTS_FILE)) {
    console.error('Semgrep results file not found:', RESULTS_FILE);
    process.exit(1);
  }
  let results;
  try {
    results = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
  } catch (err) {
    console.error('Failed to parse Semgrep results:', err);
    process.exit(1);
  }
  const severityCounts = getSeverityCounts(results);
  const highSeverityCount = severityCounts.high;
  const vulnerabilities = results.results || [];
  const scan_duration = results.metrics ? results.metrics.total_time : null;
  const failedChecks = results.errors || null;

  await logSecurityScan('semgrep', {
    vulnerabilities,
    highSeverityCount,
    scan_duration,
    failedChecks,
    raw: results
  });

  console.log(`Semgrep scan complete. High: ${highSeverityCount}, Medium: ${severityCounts.medium}, Low: ${severityCounts.low}`);
  if (highSeverityCount > 0) {
    console.error('High severity vulnerabilities found! Failing job.');
    process.exit(2);
  }
}

main();