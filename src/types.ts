export interface UserProfile {
  id: string;
  codename: string;
  role: 'Security Analyst' | 'Red Team Specialist' | 'Ethical Pentester' | 'SecOps Lead';
  clearanceLevel: 1 | 2 | 3 | 4 | 5;
  biometricRegistered: boolean;
  biometricType: 'face' | 'fingerprint' | 'passkey' | null;
  lastLogin: string;
  ipAddress: string;
  avatarSeed: string;
}

export interface TerminalEntry {
  id: string;
  timestamp: string;
  type: 'input' | 'output' | 'error' | 'success' | 'warning' | 'info';
  content: string;
  module?: string;
  details?: unknown;
}

export interface SecurityHeaderCheck {
  name: string;
  description: string;
  status: 'passed' | 'warning' | 'failed';
  currentValue?: string;
  recommendedValue: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  remediationSnippet: string;
}

export interface WebAuditReport {
  target: string;
  timestamp: string;
  score: number; // 0-100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  sslValid: boolean;
  sslIssuer?: string;
  protocol: string;
  latencyMs: number;
  headers: SecurityHeaderCheck[];
  vulnerabilities: {
    id: string;
    title: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    owaspCategory: string;
    description: string;
    remediation: string;
    codeExample: string;
  }[];
  defenseSummary: string;
}

export interface PortInfo {
  port: number;
  service: string;
  transport: 'TCP' | 'UDP';
  status: 'OPEN' | 'SECURED' | 'FILTERED' | 'EXPOSED';
  commonVulnerability: string;
  hardeningRule: string;
}

export interface OwaspItem {
  id: string;
  code: string;
  title: string;
  risk: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  exploitScenario: string;
  defensiveFix: string;
  ruleCode: string;
}
