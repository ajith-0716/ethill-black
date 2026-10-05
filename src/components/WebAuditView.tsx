import React, { useState } from 'react';
import { WebAuditReport } from '../types';
import { runSecurityAudit } from '../utils/securityAudit';
import { soundFX } from '../utils/audio';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Lock, 
  Globe, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  ExternalLink,
  Zap
} from 'lucide-react';

interface WebAuditViewProps {
  initialReport?: WebAuditReport | null;
}

export const WebAuditView: React.FC<WebAuditViewProps> = ({ initialReport }) => {
  const [urlInput, setUrlInput] = useState(initialReport?.target || 'https://mywebsite.org');
  const [report, setReport] = useState<WebAuditReport>(
    initialReport || runSecurityAudit('https://mywebsite.org')
  );
  const [isAuditing, setIsAuditing] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleAudit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;

    soundFX.playScanBeep();
    setIsAuditing(true);

    setTimeout(() => {
      const newReport = runSecurityAudit(urlInput);
      setReport(newReport);
      setIsAuditing(false);
      soundFX.playAccessGranted();
    }, 900);
  };

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    soundFX.playKeyClick();
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cybershield-audit-${report.target}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-emerald-400 border-emerald-500 bg-emerald-950/40';
      case 'B':
        return 'text-cyan-400 border-cyan-500 bg-cyan-950/40';
      case 'C':
        return 'text-amber-400 border-amber-500 bg-amber-950/40';
      case 'D':
      case 'F':
      default:
        return 'text-red-400 border-red-500 bg-red-950/40';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Search & Audit Trigger Bar */}
      <div className="bg-[#040e07] border border-emerald-600/50 rounded-lg p-5 glow-box-green">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-emerald-300 font-mono flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              TARGET WEB SURFACE AUDITOR & VULNERABILITY EVALUATOR
            </h2>
            <p className="text-xs text-emerald-500/80 font-mono mt-0.5">
              Enter any domain or URL to evaluate SSL/TLS, Security Headers, CORS, Clickjacking, and OWASP exposures.
            </p>
          </div>
          <button
            onClick={handleExportJSON}
            className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded border border-emerald-700/60 bg-emerald-950/40 hover:bg-emerald-900/60 text-xs text-emerald-300 font-mono"
          >
            <Download className="w-3.5 h-3.5" />
            Export Audit Dossier (.json)
          </button>
        </div>

        <form onSubmit={handleAudit} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="e.g. example.com, mycompany.com, or https://app.domain.io"
              className="w-full bg-black/80 border border-emerald-700/80 rounded-lg pl-9 pr-4 py-2.5 text-sm text-emerald-200 font-mono focus:border-emerald-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isAuditing}
            className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-black font-bold font-mono text-sm flex items-center gap-2 shadow-lg transition-all"
          >
            {isAuditing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Run Penetration Audit</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Target Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Score & Grade */}
        <div className={`p-4 rounded-lg border flex items-center justify-between ${getGradeColor(report.grade)}`}>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider block opacity-75">Resilience Grade</span>
            <span className="text-3xl font-extrabold font-mono">{report.grade}</span>
            <span className="text-xs font-mono block mt-1">Score: {report.score} / 100</span>
          </div>
          <div className="w-14 h-14 rounded-full border-2 border-current flex items-center justify-center font-mono font-bold text-xl">
            {report.grade}
          </div>
        </div>

        {/* SSL/TLS */}
        <div className="p-4 rounded-lg bg-[#040e07] border border-emerald-800/60 font-mono">
          <span className="text-[11px] text-emerald-500/70 uppercase tracking-wider block">Transport Encryption</span>
          <span className="text-base font-bold text-emerald-300 flex items-center gap-1.5 mt-1">
            {report.sslValid ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <ShieldX className="w-4 h-4 text-red-400" />
            )}
            {report.sslValid ? 'TLS Active' : 'Unencrypted HTTP'}
          </span>
          <span className="text-[11px] text-emerald-400/80 block mt-1 truncate">
            {report.sslIssuer}
          </span>
        </div>

        {/* Protocol & Latency */}
        <div className="p-4 rounded-lg bg-[#040e07] border border-emerald-800/60 font-mono">
          <span className="text-[11px] text-emerald-500/70 uppercase tracking-wider block">Protocol & RTT</span>
          <span className="text-base font-bold text-emerald-300 mt-1 block">
            {report.protocol}
          </span>
          <span className="text-xs text-emerald-500/90 block mt-1">
            Handshake RTT: ~{report.latencyMs} ms
          </span>
        </div>

        {/* Header Pass Ratio */}
        <div className="p-4 rounded-lg bg-[#040e07] border border-emerald-800/60 font-mono">
          <span className="text-[11px] text-emerald-500/70 uppercase tracking-wider block">Defensive Headers</span>
          <span className="text-base font-bold text-emerald-300 mt-1 block">
            {report.headers.filter((h) => h.status === 'passed').length} / {report.headers.length} Enforced
          </span>
          <span className="text-xs text-amber-400/80 block mt-1">
            {report.headers.filter((h) => h.status === 'failed').length} Missing Protections
          </span>
        </div>
      </div>

      {/* Security Headers Inspection Table */}
      <div className="bg-[#030805] border border-emerald-800/60 rounded-lg p-5">
        <h3 className="text-sm font-bold text-emerald-300 font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          HTTP Defensive Security Headers Analysis
        </h3>
        
        <div className="space-y-3">
          {report.headers.map((header, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded border text-xs font-mono ${
                header.status === 'passed'
                  ? 'bg-emerald-950/20 border-emerald-800/50'
                  : header.status === 'warning'
                  ? 'bg-amber-950/20 border-amber-800/50'
                  : 'bg-red-950/20 border-red-800/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      header.status === 'passed'
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-600'
                        : header.status === 'warning'
                        ? 'bg-amber-900/60 text-amber-300 border border-amber-600'
                        : 'bg-red-900/60 text-red-300 border border-red-600'
                    }`}
                  >
                    {header.status}
                  </span>
                  <span className="font-bold text-emerald-200 text-sm">{header.name}</span>
                </div>
                <span className="text-[11px] text-emerald-400/80 font-mono">
                  RISK: <span className={header.riskLevel === 'CRITICAL' || header.riskLevel === 'HIGH' ? 'text-red-400 font-bold' : 'text-emerald-400'}>{header.riskLevel}</span>
                </span>
              </div>

              <p className="text-emerald-400/80 mb-2">{header.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-black/60 p-2.5 rounded border border-emerald-900/40 text-[11px]">
                <div>
                  <span className="text-emerald-500/70 block uppercase text-[10px]">Current Detected Value:</span>
                  <code className="text-emerald-300">{header.currentValue || 'None'}</code>
                </div>
                <div>
                  <span className="text-emerald-500/70 block uppercase text-[10px]">Hardened Standard Value:</span>
                  <code className="text-emerald-400">{header.recommendedValue}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Identified Vulnerabilities & Solutions */}
      <div className="bg-[#030805] border border-emerald-800/60 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-emerald-300 font-mono uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Detected Attack Vectors & Defensive Remediation Solutions
          </h3>
          <span className="text-xs font-mono text-emerald-500/80">
            {report.vulnerabilities.length} Actionable Patches Available
          </span>
        </div>

        <div className="space-y-4">
          {report.vulnerabilities.map((vuln) => (
            <div
              key={vuln.id}
              className="bg-black/60 border border-emerald-900/70 rounded-lg p-4 font-mono text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-900/50 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    vuln.severity === 'CRITICAL' ? 'bg-red-900 text-red-200' : 'bg-amber-900 text-amber-200'
                  }`}>
                    {vuln.severity}
                  </span>
                  <span className="text-emerald-200 font-bold text-sm">{vuln.title}</span>
                </div>
                <span className="text-[11px] text-emerald-500">{vuln.owaspCategory}</span>
              </div>

              <div className="mb-3">
                <span className="text-emerald-500/70 uppercase text-[10px] block font-bold">Threat Mechanism / Attack Scenario:</span>
                <p className="text-emerald-400/90 mt-0.5">{vuln.description}</p>
              </div>

              <div className="mb-3">
                <span className="text-emerald-500/70 uppercase text-[10px] block font-bold">Defensive Remediation Strategy:</span>
                <p className="text-emerald-300 mt-0.5">{vuln.remediation}</p>
              </div>

              {/* Code Remediation Snippet */}
              <div>
                <div className="flex items-center justify-between bg-emerald-950/60 px-3 py-1.5 rounded-t border-t border-x border-emerald-800/60">
                  <span className="text-[11px] text-emerald-300 font-bold">Server Hardening Configuration Snippet:</span>
                  <button
                    onClick={() => handleCopyCode(vuln.id, vuln.codeExample)}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-200 transition-colors"
                  >
                    {copiedCodeId === vuln.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Patch</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-[#020503] rounded-b border border-emerald-800/60 text-emerald-300 overflow-x-auto text-[11px] leading-relaxed">
                  {vuln.codeExample}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
