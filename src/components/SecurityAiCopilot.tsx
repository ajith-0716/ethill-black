import React, { useState, useRef, useEffect } from 'react';
import { runSecurityAudit } from '../utils/securityAudit';
import { soundFX } from '../utils/audio';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Terminal, 
  FileCode, 
  Copy, 
  Check, 
  AlertTriangle 
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'copilot';
  timestamp: string;
  text: string;
  codeSnippet?: string;
  targetAudit?: ReturnType<typeof runSecurityAudit>;
}

export const SecurityAiCopilot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'copilot',
      timestamp: new Date().toLocaleTimeString(),
      text: `Greetings, Operator. I am your Cyber Intelligence & Defense Copilot.\n\nYou can ask me:\n• "What can you do?"\n• "Hack the website example.com" (I will perform an ethical attack surface audit & give the exact solution & remediation code)\n• "How to secure against Cross-Site Scripting (XSS)?"\n• "Generate a hardened Nginx config with strict CSP & HSTS"\n• "Audit my authentication flow"`,
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (userPrompt?: string) => {
    const prompt = (userPrompt || inputText).trim();
    if (!prompt) return;

    soundFX.playKeyClick();
    const userMsg: Message = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
      text: prompt,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsAnalyzing(true);
    soundFX.playScanBeep();

    const lower = prompt.toLowerCase();

    // Check if user is asking to "hack" or "audit" a website
    const hackMatch = prompt.match(/(?:hack\s+(?:the\s+website\s+)?|audit\s+|scan\s+)([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/i);

    setTimeout(() => {
      let replyText = '';
      let codeSnippet: string | undefined = undefined;
      let targetAudit: ReturnType<typeof runSecurityAudit> | undefined = undefined;

      if (hackMatch && hackMatch[1]) {
        const targetDomain = hackMatch[1];
        const audit = runSecurityAudit(targetDomain);
        targetAudit = audit;

        replyText = `### [ETHICAL PENETRATION AUDIT & REMEDIATION REPORT]
**Target Evaluated**: \`${audit.target}\`
**Security Resilience Score**: **${audit.score}/100** (Grade: **${audit.grade}**)
**Transport Layer**: ${audit.sslValid ? '✅ HTTPS Encrypted (TLS 1.3)' : '❌ Insecure Cleartext HTTP (Vulnerable to MitM)'}

#### 🔴 Attack Vectors & Vulnerabilities Identified:
${audit.vulnerabilities.map((v, i) => `**${i + 1}. ${v.title}** [Severity: ${v.severity}]
- **Attack Scenario**: ${v.description}
- **Defensive Solution**: ${v.remediation}
`).join('\n')}

#### 🛡️ Complete Defensive Solution & Production Patch:
Deploy the following server hardening configuration to patch these vectors immediately:`;

        codeSnippet = audit.vulnerabilities[0]?.codeExample || `// Global Express Security Middleware
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },
  noSniff: true,
}));`;
      } else if (lower.includes('what can you do')) {
        replyText = `### Capabilities of CyberShield Intelligence:
1. **Ethical Target Audit**: Tell me to "hack the website <domain>" or "audit <domain>", and I will run an attack-surface simulation, score its posture, and give you the step-by-step solution to defend it.
2. **Defensive Hardening**: Generate Content-Security-Policy (CSP), HSTS preload configs, CORS origin whitelists, and JWT cookie security headers.
3. **Vulnerability Remediation**: Explain OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF, IDOR) with before & after vulnerable vs hardened code snippets.
4. **Cryptography Guidance**: Recommend password hashing algorithms (Argon2id vs bcrypt), salting, and TLS 1.3 cipher suites.`;
      } else if (lower.includes('xss') || lower.includes('cross-site')) {
        replyText = `### Cross-Site Scripting (XSS) Prevention Blueprint
**Mechanism**: Attackers inject hostile JavaScript into web pages that execute within the victim's session context.

**Three Pillars of Defense**:
1. **Context-Aware Output Encoding**: Ensure user input rendered in HTML, attributes, or script tags is safely escaped.
2. **Strict Content-Security-Policy**: Prevent inline script execution and unauthorized external script domains.
3. **HttpOnly Cookies**: Protect session tokens by preventing client-side scripts from accessing them via \`document.cookie\`.`;

        codeSnippet = `// Strict CSP Header
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-rAnd0m123'; object-src 'none'; base-uri 'self';

// Cookie Hardening in Express.js
res.cookie('session_id', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 1000 * 60 * 60 * 2 // 2 hours
});`;
      } else if (lower.includes('sql') || lower.includes('injection')) {
        replyText = `### SQL Injection (SQLi) Defense Blueprint
**Mechanism**: Attackers append SQL statements into raw query strings, allowing them to bypass logins or exfiltrate the database.

**The Solution**: Parameterized Prepared Statements. Never concatenate user strings into database queries.`;

        codeSnippet = `// ❌ VULNERABLE: Direct concatenation
const sql = "SELECT * FROM users WHERE email = '" + req.body.email + "'";

// ✅ DEFENSIVE HARDENING: Parameterized query
const query = 'SELECT id, email, role FROM users WHERE email = $1 AND active = true';
const result = await db.query(query, [req.body.email]);`;
      } else {
        replyText = `I have received your cyber intelligence inquiry: "${prompt}".

In ethical cybersecurity operations, we analyze potential threat surfaces and deploy zero-trust defense architectures. 

Try asking:
- "Hack the website mycompany.com" to perform an audit and get the exact defense solution.
- "How do I secure user login with WebAuthn biometrics?"
- "What is the best way to prevent brute force attacks?"`;
      }

      const copilotMsg: Message = {
        id: 'copilot-' + Math.random().toString(36).substring(2, 9),
        sender: 'copilot',
        timestamp: new Date().toLocaleTimeString(),
        text: replyText,
        codeSnippet,
        targetAudit,
      };

      setMessages((prev) => [...prev, copilotMsg]);
      setIsAnalyzing(false);
      soundFX.playAccessGranted();
    }, 850);
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    soundFX.playKeyClick();
    setTimeout(() => setCopiedId(null), 1800);
  };

  const samplePrompts = [
    'What can you do?',
    'Hack the website example.com',
    'How to protect against SQL Injection?',
    'Generate strict Content-Security-Policy',
  ];

  return (
    <div className="flex flex-col h-[700px] bg-[#030805] border border-emerald-500/40 rounded-lg overflow-hidden glow-box-green font-mono text-xs">
      {/* Top Copilot Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#05130b] border-b border-emerald-800/60">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-400">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
              CYBER DEFENSE INTELLIGENCE COPILOT
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-400 border border-emerald-700/50">
                ACTIVE
              </span>
            </h3>
            <p className="text-[11px] text-emerald-500/80">Ethical threat vector analysis & instant remediation solutions</p>
          </div>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="flex flex-wrap gap-1.5 p-2 bg-black/40 border-b border-emerald-900/40">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-[11px] px-2.5 py-1 rounded bg-emerald-950/50 hover:bg-emerald-900/80 border border-emerald-700/40 text-emerald-300 hover:text-white transition-all flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            {p}
          </button>
        ))}
      </div>

      {/* Message Chat Flow */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 mb-1 px-1">
              <span>{msg.sender === 'user' ? 'OPERATOR' : 'SEC-COPILOT'}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`max-w-[85%] rounded-lg p-3.5 border ${
                msg.sender === 'user'
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-black/80 border-emerald-800/60 text-emerald-300'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                {msg.text}
              </div>

              {msg.codeSnippet && (
                <div className="mt-3">
                  <div className="flex items-center justify-between bg-emerald-950/80 px-2.5 py-1 rounded-t border-t border-x border-emerald-700/60 text-[10px]">
                    <span className="text-emerald-300 font-bold flex items-center gap-1">
                      <FileCode className="w-3.5 h-3.5" />
                      Defensive Code Solution
                    </span>
                    <button
                      onClick={() => handleCopyCode(msg.id, msg.codeSnippet!)}
                      className="flex items-center gap-1 text-emerald-400 hover:text-emerald-200"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy Solution'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-[#020503] rounded-b border border-emerald-700/60 text-emerald-300 text-[11px] overflow-x-auto leading-relaxed">
                    {msg.codeSnippet}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
        {isAnalyzing && (
          <div className="flex items-center gap-2 text-emerald-400 p-2 text-xs animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Analyzing attack vector & generating security patch...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-[#040e07] border-t border-emerald-800/60 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything, or type 'hack the website domain.com'..."
          className="flex-1 bg-black/80 border border-emerald-700/70 rounded px-3 py-2 text-emerald-200 text-xs focus:border-emerald-400 focus:outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isAnalyzing}
          className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-black font-bold text-xs flex items-center gap-1.5 transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
};
