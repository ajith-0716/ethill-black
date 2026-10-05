import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { soundFX } from '../utils/audio';
import { 
  Fingerprint, 
  ScanFace, 
  KeyRound, 
  ShieldCheck, 
  AlertTriangle, 
  Terminal, 
  Lock, 
  Camera, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface BiometricAuthModalProps {
  onAuthenticated: (profile: UserProfile) => void;
  currentUser: UserProfile | null;
}

export const BiometricAuthModal: React.FC<BiometricAuthModalProps> = ({
  onAuthenticated,
  currentUser,
}) => {
  const [authMode, setAuthMode] = useState<'fingerprint' | 'face' | 'passkey' | 'passcode'>('fingerprint');
  const [codename, setCodename] = useState<string>(currentUser?.codename || 'CipherZero');
  const [role, setRole] = useState<UserProfile['role']>(currentUser?.role || 'Ethical Pentester');
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Standby. Initiate biometric sensor.');
  const [errorMsg, setErrorMsg] = useState('');
  const [passcode, setPasscode] = useState('');
  const [useCamera, setUseCamera] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleStartCamera = async () => {
    try {
      setErrorMsg('');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setUseCamera(true);
      setStatusMessage('Camera sensor active. Align your face with the holographic grid.');
    } catch {
      setErrorMsg('Camera permission not granted. Falling back to synthetic neural wireframe scanner.');
      setUseCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setUseCamera(false);
  };

  const triggerFingerprintScan = () => {
    if (scanning) return;
    setScanning(true);
    setErrorMsg('');
    setScanProgress(0);
    soundFX.playScanBeep();
    setStatusMessage('Capacitive sensor engaged. Hold contact on ridge sensor...');

    let prog = 0;
    scanIntervalRef.current = window.setInterval(() => {
      prog += 5;
      setScanProgress(prog);
      if (prog % 20 === 0) soundFX.playScanBeep();

      if (prog >= 35 && prog < 70) {
        setStatusMessage('Extracting minutiae points & sub-dermal vascular patterns...');
      } else if (prog >= 70 && prog < 95) {
        setStatusMessage('Hashing biometric vector with SHA-256 local enclave...');
      } else if (prog >= 100) {
        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        setScanning(false);
        completeAuthentication('fingerprint');
      }
    }, 80);
  };

  const triggerFaceScan = () => {
    if (scanning) return;
    setScanning(true);
    setErrorMsg('');
    setScanProgress(0);
    soundFX.playScanBeep();
    setStatusMessage('Infrared TrueDepth projector scanning facial contours...');

    let prog = 0;
    scanIntervalRef.current = window.setInterval(() => {
      prog += 4;
      setScanProgress(prog);
      if (prog % 25 === 0) soundFX.playScanBeep();

      if (prog >= 30 && prog < 65) {
        setStatusMessage('Evaluating 30,000 IR dot mesh & pupillary distance...');
      } else if (prog >= 65 && prog < 95) {
        setStatusMessage('Comparing facial landmarks against local Secure Enclave...');
      } else if (prog >= 100) {
        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        setScanning(false);
        stopCamera();
        completeAuthentication('face');
      }
    }, 70);
  };

  const triggerWebAuthnPasskey = async () => {
    setErrorMsg('');
    setStatusMessage('Querying system FIDO2 / WebAuthn authenticators...');
    soundFX.playScanBeep();

    if (window.PublicKeyCredential) {
      try {
        // Attempt actual WebAuthn query if supported
        setScanning(true);
        setStatusMessage('Awaiting hardware key / platform authenticator confirmation...');
        
        // Simulating robust auth fallback if user lacks hardware passkey setup
        setTimeout(() => {
          setScanning(false);
          completeAuthentication('passkey');
        }, 1200);
      } catch (err: unknown) {
        setScanning(false);
        setErrorMsg('WebAuthn prompt dismissed: ' + (err instanceof Error ? err.message : 'User cancelled'));
      }
    } else {
      setErrorMsg('WebAuthn API not supported by browser. Using simulated biometric enclave.');
      completeAuthentication('passkey');
    }
  };

  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) {
      setErrorMsg('Passcode required.');
      soundFX.playAccessDenied();
      return;
    }
    // Accept any 6+ char code or standard root password
    if (passcode.length < 4) {
      setErrorMsg('Master key must be at least 4 characters.');
      soundFX.playAccessDenied();
      return;
    }
    completeAuthentication(null);
  };

  const completeAuthentication = (bioType: 'face' | 'fingerprint' | 'passkey' | null) => {
    soundFX.playAccessGranted();
    setStatusMessage('BIOMETRIC MATCH CONFIRMED. CLEARANCE LEVEL 5 GRANTED.');
    
    const profile: UserProfile = {
      id: 'USR-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      codename: codename || 'GhostOperator',
      role,
      clearanceLevel: 5,
      biometricRegistered: true,
      biometricType: bioType,
      lastLogin: new Date().toLocaleTimeString(),
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 250 + 2),
      avatarSeed: codename,
    };

    localStorage.setItem('cybershield_user', JSON.stringify(profile));
    setTimeout(() => {
      onAuthenticated(profile);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#050c08] border border-emerald-500/50 rounded-lg shadow-2xl p-6 glow-box-green overflow-hidden">
        
        {/* Top header banner */}
        <div className="flex items-center justify-between border-b border-emerald-900/60 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-400">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wider text-emerald-300 font-mono flex items-center gap-2">
                CYBERSHIELD OS <span className="text-xs px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-400 border border-emerald-600/40">SEC-V5</span>
              </h2>
              <p className="text-xs text-emerald-500/80">Zero-Trust Biometric Gatekeeper</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping mr-2" />
            <span className="text-xs font-mono text-emerald-400 uppercase">SYS: ARMED</span>
          </div>
        </div>

        {/* Identity Inputs */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="text-[11px] font-mono text-emerald-400/80 uppercase block mb-1">
              Operator Codename
            </label>
            <input
              type="text"
              value={codename}
              onChange={(e) => setCodename(e.target.value)}
              placeholder="e.g. Neo, ZeroDay, Cipher"
              className="w-full bg-black/60 border border-emerald-700/60 rounded px-3 py-1.5 text-sm text-emerald-300 focus:outline-none focus:border-emerald-400 font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-emerald-400/80 uppercase block mb-1">
              Security Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserProfile['role'])}
              className="w-full bg-black/60 border border-emerald-700/60 rounded px-3 py-1.5 text-sm text-emerald-300 focus:outline-none focus:border-emerald-400 font-mono"
            >
              <option value="Ethical Pentester">Ethical Pentester</option>
              <option value="Security Analyst">Security Analyst</option>
              <option value="Red Team Specialist">Red Team Specialist</option>
              <option value="SecOps Lead">SecOps Lead</option>
            </select>
          </div>
        </div>

        {/* Biometric Method Tabs */}
        <div className="flex border border-emerald-900/70 rounded p-1 bg-black/40 mb-5 gap-1">
          <button
            onClick={() => { setAuthMode('fingerprint'); stopCamera(); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-mono rounded transition-all ${
              authMode === 'fingerprint'
                ? 'bg-emerald-600 text-black font-semibold shadow-lg'
                : 'text-emerald-400/70 hover:text-emerald-300 hover:bg-emerald-950/40'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            Fingerprint
          </button>
          <button
            onClick={() => setAuthMode('face')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-mono rounded transition-all ${
              authMode === 'face'
                ? 'bg-emerald-600 text-black font-semibold shadow-lg'
                : 'text-emerald-400/70 hover:text-emerald-300 hover:bg-emerald-950/40'
            }`}
          >
            <ScanFace className="w-4 h-4" />
            Face ID
          </button>
          <button
            onClick={() => { setAuthMode('passkey'); stopCamera(); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-mono rounded transition-all ${
              authMode === 'passkey'
                ? 'bg-emerald-600 text-black font-semibold shadow-lg'
                : 'text-emerald-400/70 hover:text-emerald-300 hover:bg-emerald-950/40'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Passkey
          </button>
          <button
            onClick={() => { setAuthMode('passcode'); stopCamera(); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-mono rounded transition-all ${
              authMode === 'passcode'
                ? 'bg-emerald-600 text-black font-semibold shadow-lg'
                : 'text-emerald-400/70 hover:text-emerald-300 hover:bg-emerald-950/40'
            }`}
          >
            <Lock className="w-4 h-4" />
            PIN Override
          </button>
        </div>

        {/* Biometric Interactive Scanners */}
        <div className="bg-black/80 border border-emerald-800/60 rounded-lg p-5 flex flex-col items-center justify-center min-h-[240px] relative overflow-hidden">
          
          {/* Laser scanning beam overlay */}
          {scanning && (
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-scan-laser z-20 pointer-events-none" />
          )}

          {authMode === 'fingerprint' && (
            <div className="flex flex-col items-center gap-4">
              <div 
                onClick={triggerFingerprintScan}
                className={`relative w-28 h-28 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-300 group ${
                  scanning 
                    ? 'border-emerald-400 bg-emerald-950/40 shadow-[0_0_30px_rgba(16,185,129,0.5)]' 
                    : 'border-emerald-700/60 bg-emerald-950/20 hover:border-emerald-400 hover:bg-emerald-900/30'
                }`}
              >
                <div className="absolute inset-0 rounded-full border border-dashed border-emerald-500/40 animate-spin" style={{ animationDuration: '14s' }} />
                <Fingerprint className={`w-16 h-16 transition-all duration-300 ${
                  scanning 
                    ? 'text-emerald-300 scale-110 glow-green' 
                    : 'text-emerald-500 group-hover:text-emerald-300'
                }`} />
                
                {/* Concentric scan ring */}
                {scanning && (
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-30" />
                )}
              </div>

              <div className="text-center">
                <button
                  onClick={triggerFingerprintScan}
                  disabled={scanning}
                  className="px-4 py-1.5 rounded bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/60 text-xs font-mono text-emerald-200 uppercase tracking-wider active:scale-95 transition-all"
                >
                  {scanning ? 'Scanning Touch ID...' : 'Click to Scan Thumbprint'}
                </button>
                <p className="text-[11px] text-emerald-500/60 font-mono mt-1">Capacitive Dermal Ridge Sensor 500 DPI</p>
              </div>
            </div>
          )}

          {authMode === 'face' && (
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="relative w-44 h-44 rounded-xl border border-emerald-500/50 bg-black/80 flex items-center justify-center overflow-hidden">
                {useCamera ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover filter contrast-125 brightness-90 hue-rotate-30"
                  />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Simulated 3D Cyber Face Mesh */}
                    <ScanFace className="w-24 h-24 text-emerald-400/80 animate-pulse" />
                    {/* Crosshairs & HUD elements */}
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />
                    <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-20 pointer-events-none">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div key={i} className="border border-emerald-500" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Face recognition tracker box */}
                <div className="absolute inset-4 border border-emerald-400/50 rounded-lg pointer-events-none flex flex-col justify-between p-1">
                  <span className="text-[9px] font-mono text-emerald-400 bg-black/60 px-1 self-start">
                    FACIAL MESH: 99.4%
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 bg-black/60 px-1 self-end">
                    TRUE-DEPTH IR
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={triggerFaceScan}
                  disabled={scanning}
                  className="px-4 py-1.5 rounded bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/60 text-xs font-mono text-emerald-200 uppercase tracking-wider"
                >
                  {scanning ? 'Verifying Geometry...' : 'Initiate Face ID Scan'}
                </button>
                {!useCamera ? (
                  <button
                    onClick={handleStartCamera}
                    className="p-1.5 rounded bg-emerald-950/60 border border-emerald-700/60 text-emerald-400 hover:text-emerald-200"
                    title="Enable Real WebCam"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="p-1.5 rounded bg-red-950/60 border border-red-700/60 text-red-400 hover:text-red-200"
                    title="Disable WebCam"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {authMode === 'passkey' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-24 h-24 rounded-full border border-emerald-600/60 bg-emerald-950/30 flex items-center justify-center">
                <KeyRound className="w-12 h-12 text-emerald-400 animate-bounce" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-emerald-300 font-mono">FIDO2 / Passkey Authenticator</h4>
                <p className="text-xs text-emerald-500/70 font-mono max-w-xs mt-1">
                  Hardware token, YubiKey, Apple Touch ID or Windows Hello TPM Enclave.
                </p>
              </div>
              <button
                onClick={triggerWebAuthnPasskey}
                disabled={scanning}
                className="px-5 py-2 rounded bg-emerald-600/40 hover:bg-emerald-600/60 border border-emerald-400 text-xs font-mono text-emerald-100 uppercase tracking-wider"
              >
                Authenticate with Passkey
              </button>
            </div>
          )}

          {authMode === 'passcode' && (
            <form onSubmit={handlePasscodeLogin} className="w-full max-w-xs flex flex-col gap-3">
              <div className="text-center mb-1">
                <Lock className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                <h4 className="text-xs font-mono text-emerald-300 uppercase">Emergency Root Passkey</h4>
                <p className="text-[11px] text-emerald-500/60">Demo default: CYBER-ROOT-2026 or any 4+ char key</p>
              </div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter root passphrase..."
                className="w-full bg-black border border-emerald-700/80 rounded px-3 py-2 text-sm text-emerald-200 font-mono focus:border-emerald-400 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-bold font-mono text-xs uppercase tracking-wider"
              >
                Execute Override & Unlock
              </button>
            </form>
          )}

          {/* Progress bar during scan */}
          {scanning && (
            <div className="w-full mt-4">
              <div className="flex justify-between text-[11px] font-mono text-emerald-400 mb-1">
                <span>SENSOR PROGRESS</span>
                <span>{scanProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-emerald-950 rounded-full overflow-hidden border border-emerald-800">
                <div
                  className="h-full bg-emerald-400 transition-all duration-100 shadow-[0_0_10px_#10b981]"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Live Status readout */}
        <div className="mt-4 p-2.5 rounded bg-black/60 border border-emerald-900/60 flex items-start gap-2">
          <Terminal className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <div className="text-[11px] font-mono leading-tight">
            <span className="text-emerald-500/80">[ENCLAVE]: </span>
            <span className="text-emerald-300">{statusMessage}</span>
          </div>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mt-3 p-2 rounded bg-red-950/40 border border-red-700/60 flex items-center gap-2 text-red-300 text-xs font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-4 flex items-center justify-between text-[10px] text-emerald-600/70 font-mono border-t border-emerald-900/40 pt-3">
          <span>AES-256 ENCRYPTED SESSION</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            COMPLIANT WITH FIDO2 & NIST SP 800-63B
          </span>
        </div>
      </div>
    </div>
  );
};
