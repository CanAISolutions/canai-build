// security-events.ts
import { PostHog } from 'posthog-node';

const posthogApiKey = process.env.POSTHOG_API_KEY;
const posthog = posthogApiKey ? new PostHog(posthogApiKey) : null;

export const logSecurityScan = async (
  scanType: string,
  results: {
    vulnerabilities?: any[];
    highSeverityCount?: number;
    scan_duration?: number;
    failedChecks?: any;
    [key: string]: any;
  }
) => {
  if (!posthog) {
    console.warn('PostHog API key not set. Skipping analytics logging.');
    return;
  }
  try {
    await posthog.capture({
      distinctId: 'system',
      event: 'security_scan',
      properties: {
        scan_type: scanType,
        vulnerability_count: results.vulnerabilities ? results.vulnerabilities.length : 0,
        high_severity_count: results.highSeverityCount || 0,
        scan_duration: results.scan_duration || null,
        failed_checks: results.failedChecks || null,
        timestamp: new Date().toISOString(),
        ...results // include all other result fields for traceability
      }
    });
    console.log(`[PostHog] Logged ${scanType} scan results.`);
  } catch (err) {
    console.error(`[PostHog] Failed to log ${scanType} scan results:`, err);
  }
};