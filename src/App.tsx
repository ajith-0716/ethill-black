/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, WebAuditReport } from './types';
import { soundFX } from './utils/audio';
import { MatrixBackground } from './components/MatrixBackground';
import { BiometricAuthModal } from './components/BiometricAuthModal';
import { TerminalView } from './components/TerminalView';
import { WebAuditView } from './components/WebAuditView';
import { CryptoLabView } from './components/CryptoLabView';
import { PortScannerView } from './components/PortScannerView';
import { OwaspExplorerView } from './components/OwaspExplorerView';
import { SecurityAiCopilot } from './components/SecurityAiCopilot';
import { 
  ShieldCheck, 
  Terminal, 
  Globe, 
  Bot, 
  Key, 
  Network, 
  AlertOctagon, 
  Fingerprint, 
  Volume2, 
  VolumeX, 
  Lock, 
  Sparkles,
  Eye,
  Radio,
  Cpu
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('cybershield_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<'terminal' | 'audit' | 'copilot' | 'crypto' | 'ports' | 'owasp'>('terminal');
  const [selectedAuditReport, setSelectedAuditReport] = useState<WebAuditReport | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [matrixEnabled, setMatrixEnabled] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // If no user exists on initial load, show biometric auth modal
  useEffect(() => {
    if (!user) {
      setShowAuthModal(true);
    }
  }, [user]);

  const handleAuthenticated = (profile: UserProfile) => {
    setUser(profile);
    setShowAuthModal(false);
  };

  const handleLockSession = () => {
    soundFX.playAccessDenied();
    setShowAuthModal(true);
  };

  const handleToggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    soundFX.setEnabled(next);
    if (next) soundFX.playKeyClick();
  };

  const handleOpenAuditFromTerminal = (report: WebAuditReport) => {
    setSelectedAuditReport(report);
    setActiveTab('audit');
    soundFX.playScanBeep();
  };

  const navigationTabs = [
    { id: 'terminal', label: 'Terminal CLI', icon: Terminal },
    { id: 'audit', label: 'Web Surface Auditor', icon: Globe },
    { id: 'copilot', label: 'Defense Copilot', icon: Bot },
    { id: 'crypto', label: 'Crypto & Hash Lab', icon: Key },
    { id: 'ports', label: 'Port & Firewall Matrix', icon: Network },
    { id: 'owasp', label: 'OWASP Top 10', icon: AlertOctagon },
  ] as const;

  return (
    <div className="relative min-h-screen bg-black text-emerald-400 selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden">
      {/* Matrix falling code rain background */}
      {matrixEnabled && <MatrixBackground opacity={0.16} colorScheme="green" />}

      {/* CRT overlay scanlines */}
      <div className="crt-overlay fixed inset-0 z-10 pointer-events-none" />

      {/* Biometric Login Modal */}
      {showAuthModal && (
        <BiometricAuthModal
          currentUser={user}
          onAuthenticated={handleAuthenticated}
        />
      )}

      {/* Main Workspace Layout */}
      <div className="relative z-20 flex flex-col min-h-screen">
        
        {/* Top Hacker HUD Header */}
        <header className="border-b border-emerald-900/80 bg-black/80 backdrop-blur-md sticky top-0 z-30 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Branding & Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 glow-box-green">
                <ShieldCheck className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-extrabold tracking-wider text-emerald-300 font-mono flex items-center gap-1.5 glow-green">
                    CYBERSHIELD<span className="text-emerald-500">_OS</span>
                  </h1>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-600/50 font-mono">
                    SEC-DEFENSE v5.2
                  </span>
                </div>
                <p className="text-[11px] text-emerald-500/80 font-mono flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-emerald-400 animate-ping" />
                  DEFENSIVE TELEMETRY ACTIVE // ZERO-TRUST PROTOCOL
                </p>
              </div>
            </div>

            {/* Quick Status & Operator Controls */}
            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden md:flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/60 rounded px-3 py-1 font-mono text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-300 font-bold">{user.codename}</span>
                  <span className="text-emerald-600">|</span>
                  <span className="text-emerald-400/80 text-[11px]">{user.role}</span>
                  <span className="text-emerald-600">|</span>
                  <span className="text-emerald-400 font-mono text-[10px] px-1.5 py-0.2 rounded bg-emerald-900/80">
                    LVL {user.clearanceLevel}
                  </span>
                </div>
              )}

              {/* Sound Toggle */}
              <button
                onClick={handleToggleAudio}
                className="p-1.5 rounded border border-emerald-800/60 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 transition-colors"
                title={audioEnabled ? 'Mute acoustics' : 'Enable acoustics'}
              >
                {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-emerald-600" />}
              </button>

              {/* Matrix Toggle */}
              <button
                onClick={() => setMatrixEnabled(!matrixEnabled)}
                className={`p-1.5 rounded border transition-colors ${
                  matrixEnabled 
                    ? 'border-emerald-700 bg-emerald-950/60 text-emerald-300' 
                    : 'border-emerald-900 bg-black/60 text-emerald-600'
                }`}
                title="Toggle Matrix Rain"
              >
                <Eye className="w-4 h-4" />
              </button>

              {/* Lock Biometric Button */}
              <button
                onClick={handleLockSession}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-600/50 text-xs font-mono text-emerald-200 transition-all"
                title="Lock Terminal & Re-authenticate Biometrics"
              >
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Biometric Lock</span>
              </button>
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <div className="max-w-7xl mx-auto mt-3 flex overflow-x-auto gap-1 border-t border-emerald-900/40 pt-2 pb-0.5 no-scrollbar">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab);
                    soundFX.playKeyClick();
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-mono whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      : 'text-emerald-400/80 hover:text-emerald-200 hover:bg-emerald-950/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
          {activeTab === 'terminal' && user && (
            <div className="h-[750px]">
              <TerminalView
                user={user}
                onOpenAudit={handleOpenAuditFromTerminal}
                onSelectTab={(tabId) => setActiveTab(tabId as typeof activeTab)}
              />
            </div>
          )}

          {activeTab === 'audit' && (
            <WebAuditView initialReport={selectedAuditReport} />
          )}

          {activeTab === 'copilot' && (
            <SecurityAiCopilot />
          )}

          {activeTab === 'crypto' && (
            <CryptoLabView />
          )}

          {activeTab === 'ports' && (
            <PortScannerView />
          )}

          {activeTab === 'owasp' && (
            <OwaspExplorerView />
          )}
        </main>

        {/* Tactical Footer */}
        <footer className="border-t border-emerald-900/60 bg-black/90 py-3 px-4 font-mono text-[11px] text-emerald-600">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>CYBERSHIELD ETHICAL DEFENSE WORKSTATION</span>
              <span>•</span>
              <span>ZERO-TRUST ENVIRONMENT</span>
            </div>
            <div className="flex items-center gap-3 text-emerald-500/80">
              <span>NIST SP 800-63B</span>
              <span>•</span>
              <span>OWASP TOP 10 (2021)</span>
              <span>•</span>
              <span>TLS 1.3 / FIDO2</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
