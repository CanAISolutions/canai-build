// process-audit-results.js
const fs = require('fs');
const path = require('path');
const { logSecurityScan } = require('./security-events');

const RESULTS_FILE = path.resolve('audit-results.json');

function getSeverityCounts(advisories) {
  const severityCounts = { critical: 0, high: 0, moderate: 0, low: 0 };
  if (!advisories) return severityCounts;
  for (const id in advisories) {
    const sev = advisories[id].severity;
    if (severityCounts[sev] !== undefined) severityCounts[sev]++;
  }
  return severityCounts;
}

async function main() {
  if (!fs.existsSync(RESULTS_FILE)) {
    console.error('npm audit results file not found:', RESULTS_FILE);
    process.exit(1);
  }
  let results;
  try {
    results = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
  } catch (err) {
    console.error('Failed to parse npm audit results:', err);
    process.exit(1);
  }
  const advisories = results.advisories || {};
  const vulnerabilities = Object.values(advisories);
  const severityCounts = getSeverityCounts(advisories);
  const highSeverityCount = (severityCounts.critical || 0) + (severityCounts.high || 0);
  const scan_duration = null; // npm audit does not provide duration
  const failedChecks = results.error || null;

  await logSecurityScan('npm_audit', {
    vulnerabilities,
    highSeverityCount,
    scan_duration,
    failedChecks,
    raw: results
  });

  console.log(`npm audit complete. Critical: ${severityCounts.critical}, High: ${severityCounts.high}, Moderate: ${severityCounts.moderate}, Low: ${severityCounts.low}`);
  if (highSeverityCount > 0) {
    console.error('High or critical vulnerabilities found! Failing job.');
    process.exit(2);
  }
}

main();