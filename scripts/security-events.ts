// security-events.ts
import { PostHog } from 'posthog-node';

const posthogApiKey = process.env.POSTHOG_API_KEY;
const posthog = posthogApiKey ? new PostHog(posthogApiKey) : null;

// --- Type Definitions for Security Scan Results ---

// Semgrep finding structure
export interface SemgrepFinding {
  check_id: string;
  path: string;
  start: { line: number; col: number };
  end: { line: number; col: number };
  extra: {
    message: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW' | string;
    [key: string]: any;
  };
  [key: string]: any;
}

// npm audit advisory structure
export interface NpmAuditAdvisory {
  module_name: string;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  title: string;
  vulnerable_versions: string;
  recommendation: string;
  url: string;
  [key: string]: any;
}

// ZAP alert structure
export interface ZapAlert {
  alert: string;
  risk: 'High' | 'Medium' | 'Low' | 'Informational';
  url: string;
  param: string;
  evidence: string;
  [key: string]: any;
}

// Union type for vulnerabilities
export type Vulnerability = SemgrepFinding | NpmAuditAdvisory | ZapAlert;

// Union type for failedChecks/errors
export type FailedCheck = string | { [key: string]: any } | null;

export interface SecurityScanResults {
  vulnerabilities?: Vulnerability[];
  highSeverityCount?: number;
  scan_duration?: number;
  failedChecks?: FailedCheck;
  [key: string]: any;
}

export const logSecurityScan = async (
  scanType: string,
  results: SecurityScanResults
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
        vulnerability_count: results.vulnerabilities
          ? results.vulnerabilities.length
          : 0,
        high_severity_count: results.highSeverityCount || 0,
        scan_duration: results.scan_duration || null,
        failed_checks: results.failedChecks || null,
        timestamp: new Date().toISOString(),
        ...results, // include all other result fields for traceability
      },
    });
    console.log(`[PostHog] Logged ${scanType} scan results.`);
  } catch (err) {
    console.error(`[PostHog] Failed to log ${scanType} scan results:`, err);
  }
};
