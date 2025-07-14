// process-zap-results.js
const fs = require('fs');
const path = require('path');
const { logSecurityScan } = require('./security-events');

const RESULTS_FILE = path.resolve('zap_output.json'); // ZAP output file name may vary

function getSeverityCounts(alerts) {
  const severityCounts = { High: 0, Medium: 0, Low: 0, Informational: 0 }; // ZAP uses these
  if (!Array.isArray(alerts)) return severityCounts;
  for (const alert of alerts) {
    if (severityCounts[alert.risk] !== undefined) severityCounts[alert.risk]++;
  }
  return severityCounts;
}

async function main() {
  if (!fs.existsSync(RESULTS_FILE)) {
    console.error('ZAP results file not found:', RESULTS_FILE);
    process.exit(1);
  }
  let results;
  try {
    results = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
  } catch (err) {
    console.error('Failed to parse ZAP results:', err);
    process.exit(1);
  }
  const alerts = results.site && results.site[0] && results.site[0].alerts ? results.site[0].alerts : [];
  const severityCounts = getSeverityCounts(alerts);
  const highSeverityCount = severityCounts.High;
  const scan_duration = results.generated ? null : null; // ZAP JSON may not include duration
  const failedChecks = results.failures || null;

  await logSecurityScan('zap', {
    vulnerabilities: alerts,
    highSeverityCount,
    scan_duration,
    failedChecks,
    raw: results
  });

  console.log(`ZAP scan complete. High: ${severityCounts.High}, Medium: ${severityCounts.Medium}, Low: ${severityCounts.Low}, Informational: ${severityCounts.Informational}`);
  if (highSeverityCount > 0) {
    console.error('High severity vulnerabilities found in ZAP scan! Failing job.');
    process.exit(2);
  }
}

main();