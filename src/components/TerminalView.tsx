import React, { useState, useEffect, useRef } from 'react';
import { TerminalEntry, UserProfile, WebAuditReport } from '../types';
import { runSecurityAudit } from '../utils/securityAudit';
import { computeSha256, computeMd5, encodeBase64, decodeBase64, analyzePassword } from '../utils/cryptoLab';
import { soundFX } from '../utils/audio';
import { 
  Terminal as TerminalIcon, 
  Send, 
  Trash2, 
  CornerDownLeft, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface TerminalViewProps {
  user: UserProfile;
  onOpenAudit: (report: WebAuditReport) => void;
  onSelectTab: (tabId: string) => void;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  user,
  onOpenAudit,
  onSelectTab,
}) => {
  const [entries, setEntries] = useState<TerminalEntry[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      content: `[CYBERSHIELD DEFENSE KERNEL v5.2 initialized]\nAuthenticated Operator: ${user.codename} (${user.role}) | Clearance: Level ${user.clearanceLevel}\nBiometric Validation: ACTIVE [${user.biometricType?.toUpperCase() || 'PASSKEY'}]\nType 'what can you do' or 'help' to review offensive & defensive modules.`,
    },
    {
      id: 'init-2',
      timestamp: new Date().toLocaleTimeString(),
      type: 'output',
      content: `Tip: Type "hack <domain>" (e.g. "hack example.com") to simulate an ethical penetration test & receive immediate vulnerability remediations!`,
    }
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  const addEntry = (type: TerminalEntry['type'], content: string, details?: unknown) => {
    const newEntry: TerminalEntry = {
      id: 'entry-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      content,
      details,
    };
    setEntries((prev) => [...prev, newEntry]);
  };

  const handleCommand = async (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    soundFX.playKeyClick();
    addEntry('input', `$ ${cmd}`);
    setHistory((prev) => [cmd, ...prev]);
    setHistoryIdx(-1);
    setInput('');
    setIsProcessing(true);

    const lower = cmd.toLowerCase();

    // 1. "what can you do" or "help"
    if (lower === 'what can you do' || lower === 'help' || lower === 'commands' || lower === 'man') {
      setTimeout(() => {
        addEntry(
          'output',
          `══════════════════════════════════════════════════════════════════
CYBERSHIELD SEC-OPS: CAPABILITIES & AVAILABLE COMMANDS
══════════════════════════════════════════════════════════════════

1. PENETRATION TESTING & AUDIT SIMULATOR:
   • hack <domain>           - Launch simulated ethical pentest, evaluate attack surface & get defense patches
   • audit <domain>          - Deep website security audit (SSL, HSTS, CSP, X-Frame-Options, Cookies)
   • headers <domain>        - Inspect HTTP security headers & missing protections

2. CRYPTOGRAPHY & CIPHER TOOLS:
   • sha256 <text>           - Compute cryptographic SHA-256 hash
   • md5 <text>              - Generate legacy MD5 checksum
   • base64 <encode|decode>  - Encode or decode Base64 strings
   • password <pwd>          - Test password entropy against GPU brute-force clusters

3. NETWORK & HARDENING:
   • ports                   - Open ports scanner & firewall defense guide
   • owasp                   - Open OWASP Top 10 mitigation framework

4. WORKSTATION UTILITIES:
   • whoami                  - Inspect operator credentials & clearance level
   • clear                   - Flush terminal log history
   • sound <on|off>          - Toggle tactical terminal acoustics
══════════════════════════════════════════════════════════════════`
        );
        setIsProcessing(false);
      }, 300);
      return;
    }

    // 2. Clear
    if (lower === 'clear' || lower === 'cls') {
      setEntries([]);
      setIsProcessing(false);
      return;
    }

    // 3. Whoami
    if (lower === 'whoami' || lower === 'id') {
      setTimeout(() => {
        addEntry(
          'info',
          `OPERATOR IDENTITY DOSSIER:\nCodename: ${user.codename}\nRole: ${user.role}\nClearance: LEVEL ${user.clearanceLevel} (TOP SECRET // DEFENSE OPS)\nBiometric Authentication: VERIFIED (${user.biometricType?.toUpperCase() || 'HARDWARE TOKEN'})\nTerminal IP: ${user.ipAddress}\nSession: ENCRYPTED-TLS-1.3`
        );
        setIsProcessing(false);
      }, 250);
      return;
    }

    // 4. Sound control
    if (lower.startsWith('sound ')) {
      const mode = lower.split(' ')[1];
      if (mode === 'off') {
        soundFX.setEnabled(false);
        addEntry('output', 'Acoustic audio synthesis: DISABLED');
      } else {
        soundFX.setEnabled(true);
        soundFX.playAccessGranted();
        addEntry('output', 'Acoustic audio synthesis: ENABLED');
      }
      setIsProcessing(false);
      return;
    }

    // 5. "hack <website>" or "hack the website <url>" or "audit <url>"
    if (
      lower.startsWith('hack ') ||
      lower.startsWith('hack the website ') ||
      lower.startsWith('audit ') ||
      lower.startsWith('scan ')
    ) {
      let target = '';
      if (lower.startsWith('hack the website ')) {
        target = cmd.substring('hack the website '.length).trim();
      } else if (lower.startsWith('hack ')) {
        target = cmd.substring('hack '.length).trim();
      } else if (lower.startsWith('audit ')) {
        target = cmd.substring('audit '.length).trim();
      } else {
        target = cmd.substring('scan '.length).trim();
      }

      if (!target) {
        addEntry('error', 'Error: Target domain or URL required. Example: "hack example.com" or "audit myapp.io"');
        setIsProcessing(false);
        return;
      }

      addEntry('warning', `[!] INITIATING AUTHORIZED DEFENSIVE AUDIT & THREAT VECTOR SIMULATION ON: ${target}`);
      addEntry('info', `[*] Reconnaissance: Resolving DNS, testing TLS cipher suites, analyzing HTTP response headers...`);
      soundFX.playScanBeep();

      setTimeout(() => {
        const report = runSecurityAudit(target);
        soundFX.playAccessGranted();

        const summaryText = `══════════════════════════════════════════════════════════════════
SECURITY ASSESSMENT FOR: ${report.target}
OVERALL RESILIENCE SCORE: ${report.score}/100 [GRADE ${report.grade}]
PROTOCOL: ${report.protocol} | LATENCY: ${report.latencyMs}ms
══════════════════════════════════════════════════════════════════

IDENTIFIED VULNERABILITY VECTORS & THREAT IMPACT:
${report.vulnerabilities.map((v, i) => `[0${i+1}] ${v.title} [SEVERITY: ${v.severity}]
    OWASP Category: ${v.owaspCategory}
    Attack Vector: ${v.description}
    Defensive Fix: ${v.remediation}
`).join('\n')}

══════════════════════════════════════════════════════════════════
PRIMARY REMEDIATION CODE (DEPLOY TO SECURE TARGET):
${report.vulnerabilities[0]?.codeExample || 'No critical patch required.'}
══════════════════════════════════════════════════════════════════`;

        addEntry('output', summaryText, report);
        setIsProcessing(false);
      }, 1200);
      return;
    }

    // 6. SHA-256
    if (lower.startsWith('sha256 ')) {
      const text = cmd.substring('sha256 '.length);
      const hash = await computeSha256(text);
      addEntry('output', `INPUT: "${text}"\nSHA-256: ${hash}`);
      setIsProcessing(false);
      return;
    }

    // 7. MD5
    if (lower.startsWith('md5 ')) {
      const text = cmd.substring('md5 '.length);
      const hash = computeMd5(text);
      addEntry('output', `INPUT: "${text}"\nMD5: ${hash} [Note: MD5 is cryptographically broken; use SHA-256 for secure applications]`);
      setIsProcessing(false);
      return;
    }

    // 8. Base64
    if (lower.startsWith('base64 encode ') || lower.startsWith('base64 -e ')) {
      const text = cmd.replace(/^base64\s+(-e|encode)\s+/, '');
      addEntry('output', `BASE64 ENCODED: ${encodeBase64(text)}`);
      setIsProcessing(false);
      return;
    }
    if (lower.startsWith('base64 decode ') || lower.startsWith('base64 -d ')) {
      const text = cmd.replace(/^base64\s+(-d|decode)\s+/, '');
      addEntry('output', `BASE64 DECODED: ${decodeBase64(text)}`);
      setIsProcessing(false);
      return;
    }

    // 9. Password test
    if (lower.startsWith('password ') || lower.startsWith('pwd ')) {
      const pwd = cmd.replace(/^(password|pwd)\s+/, '');
      const analysis = analyzePassword(pwd);
      addEntry(
        analysis.strength === 'CRITICAL_WEAK' || analysis.strength === 'WEAK' ? 'warning' : 'output',
        `PASSWORD ENTROPY AUDIT:
Entropy: ${analysis.entropyBits} bits
Resilience Tier: ${analysis.strength}
Estimated Offline Brute-force Time: ${analysis.crackTimeEstimate}
Security Notes:\n${analysis.feedback.map(f => '• ' + f).join('\n')}`
      );
      setIsProcessing(false);
      return;
    }

    // 10. Ports
    if (lower === 'ports' || lower === 'port scan') {
      onSelectTab('ports');
      addEntry('info', 'Switching interface to Network Port Hardening & Firewall Matrix...');
      setIsProcessing(false);
      return;
    }

    // 11. OWASP
    if (lower === 'owasp' || lower === 'owasp top 10') {
      onSelectTab('owasp');
      addEntry('info', 'Switching interface to OWASP Top 10 Mitigation Matrix...');
      setIsProcessing(false);
      return;
    }

    // Fallback: Natural language reasoning for user queries
    setTimeout(() => {
      let response = '';
      if (lower.includes('hack') && (lower.includes('how') || lower.includes('can'))) {
        response = `Ethical Penetration Testing Workflow:
1. Reconnaissance: Passive DNS & OSINT information gathering.
2. Port & Service Enumeration: Identifying open daemons (SSH, Web, DB).
3. Vulnerability Scanning: Header analysis (CSP, HSTS, CORS), checking for known CVEs.
4. Exploitation Simulation: Testing input sanitization against SQLi, XSS, and CSRF.
5. Defensive Remediation: Applying WAF rules, parameterized queries, and strict CSP headers.
To audit a specific site, type: "hack <domain>" (e.g. "hack target.com").`;
      } else if (lower.includes('sql') || lower.includes('sqli')) {
        response = `SQL INJECTION DEFENSE GUIDE:
Threat: Attackers inject SQL syntax via unsanitized user inputs to read or destroy database tables.
Vulnerable Example:
  db.query("SELECT * FROM users WHERE email = '" + req.body.email + "'")
Remediation (Parameterized Prepared Statements):
  db.query("SELECT * FROM users WHERE email = $1", [req.body.email])
Always use ORMs (Drizzle, Prisma) or prepared statements with strict input type validation.`;
      } else if (lower.includes('xss') || lower.includes('cross-site')) {
        response = `CROSS-SITE SCRIPTING (XSS) DEFENSE:
Threat: Untrusted JavaScript is injected into web pages viewed by other users, stealing session cookies.
Solution:
1. Context-aware output encoding (React JSX automatically escapes variables by default).
2. Deploy a strict Content Security Policy (CSP):
   Content-Security-Policy: default-src 'self'; script-src 'self';
3. Set the HttpOnly cookie flag so JavaScript cannot read session tokens via document.cookie.`;
      } else {
        response = `Command not recognized: "${cmd}".\nType "what can you do" or "help" for a full list of offensive & defensive modules.`;
      }

      addEntry('output', response);
      setIsProcessing(false);
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    } else if (e.key === 'ArrowUp') {
      if (history.length > 0) {
        const nextIdx = Math.min(historyIdx + 1, history.length - 1);
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx]);
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInput('');
      }
    } else {
      soundFX.playKeyClick();
    }
  };

  const quickActions = [
    { label: 'What can you do?', cmd: 'what can you do' },
    { label: 'Hack / Audit example.com', cmd: 'hack example.com' },
    { label: 'Analyze Password', cmd: 'password P@ssw0rd!2026_Secure' },
    { label: 'SHA-256 Hash', cmd: 'sha256 ZeroDayPayload' },
    { label: 'OWASP Guide', cmd: 'owasp' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#030805] border border-emerald-500/40 rounded-lg overflow-hidden glow-box-green">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#05130b] border-b border-emerald-800/60 select-none">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600/80 inline-block border border-red-500/50" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block border border-amber-400/50" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block border border-emerald-400/50" />
          </div>
          <span className="text-xs font-mono font-bold text-emerald-300 ml-2 flex items-center gap-1.5">
            <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
            root@{user.codename.toLowerCase()}:~# /bin/cybershield-sh
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-emerald-500/70 hidden sm:inline">TTY: 001/PTY</span>
          <button
            onClick={() => setEntries([])}
            className="flex items-center gap-1 text-emerald-400/80 hover:text-emerald-200 transition-colors p-1 rounded hover:bg-emerald-950/40"
            title="Clear terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Clear</span>
          </button>
        </div>
      </div>

      {/* Terminal Quick Suggestion Chips */}
      <div className="flex flex-wrap gap-1.5 px-3 py-1.5 bg-black/40 border-b border-emerald-900/40">
        <span className="text-[10px] font-mono text-emerald-500/70 self-center mr-1">QUICK:</span>
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => handleCommand(action.cmd)}
            className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/50 text-emerald-300 hover:text-white transition-all flex items-center gap-1"
          >
            <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
            {action.label}
          </button>
        ))}
      </div>

      {/* Terminal Output Log Area */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-3 select-text leading-relaxed">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`rounded p-2 border ${
              entry.type === 'input'
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300 font-bold'
                : entry.type === 'error'
                ? 'bg-red-950/40 border-red-700/50 text-red-300'
                : entry.type === 'warning'
                ? 'bg-amber-950/40 border-amber-700/50 text-amber-300'
                : entry.type === 'info'
                ? 'bg-cyan-950/30 border-cyan-700/40 text-cyan-300'
                : 'bg-black/60 border-emerald-900/40 text-emerald-400'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] opacity-60 mb-1 border-b border-current/20 pb-0.5">
              <span>{entry.type.toUpperCase()}</span>
              <span>{entry.timestamp}</span>
            </div>
            <pre className="whitespace-pre-wrap break-all font-mono">{entry.content}</pre>
            
            {/* If entry has a WebAuditReport attached, render interactive launch button */}
            {Boolean(entry.details && typeof entry.details === 'object' && 'score' in (entry.details as Record<string, unknown>)) && (
              <div className="mt-3 pt-2 border-t border-emerald-800/60 flex items-center justify-between">
                <span className="text-[11px] text-emerald-300">
                  Full security dossier generated with interactive code patches.
                </span>
                <button
                  onClick={() => onOpenAudit(entry.details as WebAuditReport)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-black font-bold font-mono rounded text-xs transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  View Interactive Audit Report
                </button>
              </div>
            )}
          </div>
        ))}
        {isProcessing && (
          <div className="flex items-center gap-2 text-emerald-400 p-2 font-mono text-xs animate-pulse">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Processing cyber intelligence payload...</span>
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Input Bar */}
      <div className="p-3 bg-[#040e07] border-t border-emerald-800/60 flex items-center gap-2">
        <span className="text-emerald-400 font-mono font-bold text-sm shrink-0 flex items-center gap-1">
          <span className="text-emerald-500">root@shield</span>
          <span className="text-emerald-300">:~$</span>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type 'what can you do', 'hack example.com', or any security command..."
          className="flex-1 bg-black/60 border border-emerald-700/60 rounded px-3 py-1.5 text-xs text-emerald-200 font-mono focus:outline-none focus:border-emerald-400"
          autoFocus
        />
        <button
          onClick={() => handleCommand(input)}
          disabled={!input.trim() || isProcessing}
          className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-black font-mono font-bold text-xs flex items-center gap-1 transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Exec</span>
        </button>
      </div>
    </div>
  );
};
