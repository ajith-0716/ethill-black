import React, { useState } from 'react';
import { OwaspItem } from '../types';
import { soundFX } from '../utils/audio';
import { 
  ShieldAlert, 
  FileCode, 
  Copy, 
  Check, 
  ChevronRight,
  ShieldCheck,
  AlertOctagon
} from 'lucide-react';

const OWASP_LIST: OwaspItem[] = [
  {
    id: 'a01',
    code: 'A01:2021',
    title: 'Broken Access Control',
    risk: 'CRITICAL',
    description: 'Flaws allow unauthorized users to view, modify, or delete sensitive data or bypass business logic.',
    exploitScenario: 'An attacker modifies an ID in a request: GET /api/user/1042/payroll without verifying if the caller owns or is authorized to read account 1042.',
    defensiveFix: 'Enforce strict server-side Role-Based Access Control (RBAC) and verify ownership on every single privileged operation.',
    ruleCode: `// Enforce authorization checks in server endpoint:\nasync function getPayroll(req, res) {\n  const { accountId } = req.params;\n  if (req.user.id !== accountId && req.user.role !== 'SUPER_ADMIN') {\n    return res.status(403).json({ error: 'Access Denied: Insufficient Clearance' });\n  }\n  return res.json(await db.fetchPayroll(accountId));\n}`
  },
  {
    id: 'a02',
    code: 'A02:2021',
    title: 'Cryptographic Failures',
    risk: 'CRITICAL',
    description: 'Sensitive data transmitted in cleartext, weak encryption algorithms (MD5, DES), or hardcoded API keys.',
    exploitScenario: 'Database passwords stored with simple MD5 or passwords transmitted over plaintext HTTP, susceptible to packet capture.',
    defensiveFix: 'Encrypt all data in transit using TLS 1.3. Hash passwords using Argon2id or bcrypt with high work factors. Never hardcode secrets.',
    ruleCode: `// Use modern Argon2id or bcrypt with salt:\nimport bcrypt from 'bcrypt';\nconst saltRounds = 12;\nconst passwordHash = await bcrypt.hash(plaintextPassword, saltRounds);`
  },
  {
    id: 'a03',
    code: 'A03:2021',
    title: 'Injection (SQL, NoSQL, OS Command)',
    risk: 'CRITICAL',
    description: 'Hostile data sent to an interpreter as part of a command or query, resulting in unauthorized command execution.',
    exploitScenario: `Input: admin' OR '1'='1 -- which bypasses authentication logic.`,
    defensiveFix: 'Always use parameterized prepared statements or safe Object-Relational Mappers (ORMs). Validate input types against strict schemas.',
    ruleCode: `// Prepared statement with parameterized placeholders:\nconst query = 'SELECT id, username FROM users WHERE username = $1 AND active = true';\nconst user = await db.query(query, [safeUsername]);`
  },
  {
    id: 'a04',
    code: 'A04:2021',
    title: 'Insecure Design',
    risk: 'HIGH',
    description: 'Flaws resulting from lack of threat modeling, architecture flaws, and absence of defensive design patterns.',
    exploitScenario: 'E-commerce platform lacks rate limiting on password reset endpoints, enabling unlimited credential stuffing.',
    defensiveFix: 'Integrate threat modeling (STRIDE) during architecture design and implement strict IP rate limiting & progressive lockout.',
    ruleCode: `// Rate Limiting Middleware (Express rate-limit)\nimport rateLimit from 'express-rate-limit';\nexport const authLimiter = rateLimit({\n  windowMs: 15 * 60 * 1000,\n  max: 5,\n  message: 'Too many attempts, account locked for 15 minutes.'\n});`
  },
  {
    id: 'a05',
    code: 'A05:2021',
    title: 'Security Misconfiguration',
    risk: 'HIGH',
    description: 'Default credentials enabled, verbose error stack traces exposed to users, or missing HTTP security headers.',
    exploitScenario: 'Server throws uncaught exception and outputs database connection string and stack trace directly in browser response.',
    defensiveFix: 'Disable default accounts, run automated configuration audits, and suppress detailed internal stack traces in production.',
    ruleCode: `// Production Error Sanitizer:\napp.use((err, req, res, next) => {\n  console.error(err.stack);\n  res.status(500).json({ error: 'Internal system fault', incidentId: req.id });\n});`
  },
  {
    id: 'a07',
    code: 'A07:2021',
    title: 'Identification and Authentication Failures',
    risk: 'HIGH',
    description: 'Vulnerabilities in login, session timeouts, credential stuffing resistance, and brute-force defenses.',
    exploitScenario: 'Session tokens stored in localStorage accessible by third-party scripts, or sessions that never expire upon logout.',
    defensiveFix: 'Deploy Multi-Factor Authentication (MFA), biometric WebAuthn, and store session tokens only in HttpOnly SameSite=Strict cookies.',
    ruleCode: `// Set secure session cookie flags:\nres.cookie('token', jwtToken, {\n  httpOnly: true,\n  secure: true,\n  sameSite: 'strict',\n  maxAge: 3600000 // 1 hour\n});`
  }
];

export const OwaspExplorerView: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<OwaspItem>(OWASP_LIST[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    soundFX.playKeyClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 font-mono text-xs">
      <div className="bg-[#040e07] border border-emerald-600/50 rounded-lg p-5 glow-box-green">
        <h2 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-emerald-400" />
          OWASP TOP 10 DEFENSIVE BLUEPRINT & EXPLOIT MITIGATION
        </h2>
        <p className="text-xs text-emerald-500/80 mt-0.5">
          Industry standard vulnerability knowledgebase with architectural defense remediations and production patches.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation list */}
        <div className="space-y-2 lg:col-span-1">
          {OWASP_LIST.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedItem(item);
                soundFX.playKeyClick();
              }}
              className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                selectedItem.id === item.id
                  ? 'bg-emerald-950/70 border-emerald-400 text-emerald-200 shadow-md'
                  : 'bg-[#030805] border-emerald-900/60 text-emerald-400/80 hover:bg-emerald-950/30 hover:border-emerald-700'
              }`}
            >
              <div>
                <span className="text-[10px] text-emerald-500 block">{item.code}</span>
                <span className="font-bold text-xs">{item.title}</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${selectedItem.id === item.id ? 'translate-x-1 text-emerald-300' : 'opacity-40'}`} />
            </button>
          ))}
        </div>

        {/* Selected Item Detail */}
        <div className="lg:col-span-2 bg-[#030805] border border-emerald-800/70 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3 mb-4">
              <div>
                <span className="text-[10px] text-emerald-500">{selectedItem.code}</span>
                <h3 className="text-base font-bold text-emerald-200">{selectedItem.title}</h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                selectedItem.risk === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-700' : 'bg-amber-950 text-amber-300 border border-amber-700'
              }`}>
                RISK: {selectedItem.risk}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-emerald-500/80 uppercase font-bold block">Vulnerability Overview:</span>
                <p className="text-emerald-400 text-xs mt-1 leading-relaxed">{selectedItem.description}</p>
              </div>

              <div className="bg-red-950/20 border border-red-900/40 p-3 rounded">
                <span className="text-[10px] text-red-400 uppercase font-bold block flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Exploitation Scenario / Threat Vector:
                </span>
                <p className="text-red-300 text-xs mt-1">{selectedItem.exploitScenario}</p>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-900/40 p-3 rounded">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Engineering Mitigation & Defensive Fix:
                </span>
                <p className="text-emerald-300 text-xs mt-1">{selectedItem.defensiveFix}</p>
              </div>
            </div>
          </div>

          {/* Code Patch */}
          <div className="mt-5">
            <div className="flex items-center justify-between bg-emerald-950/70 px-3 py-1.5 rounded-t border-t border-x border-emerald-800/60">
              <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5" />
                Defensive Code Implementation:
              </span>
              <button
                onClick={() => handleCopy(selectedItem.ruleCode)}
                className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-200"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Snippet'}</span>
              </button>
            </div>
            <pre className="p-3 bg-black/90 rounded-b border border-emerald-800/60 text-emerald-300 overflow-x-auto text-[11px] leading-relaxed">
              {selectedItem.ruleCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
