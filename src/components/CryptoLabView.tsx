import React, { useState, useEffect } from 'react';
import { 
  computeSha256, 
  computeSha512, 
  computeMd5, 
  encodeBase64, 
  decodeBase64, 
  rot13, 
  analyzePassword, 
  PasswordAnalysis 
} from '../utils/cryptoLab';
import { soundFX } from '../utils/audio';
import { 
  Key, 
  Hash, 
  ShieldCheck, 
  Lock, 
  Copy, 
  Check, 
  Cpu, 
  FileCode,
  Activity
} from 'lucide-react';

export const CryptoLabView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hash' | 'password' | 'ciphers'>('hash');
  
  // Hash state
  const [hashInput, setHashInput] = useState('SecurityPayload_2026');
  const [sha256Result, setSha256Result] = useState('');
  const [sha512Result, setSha512Result] = useState('');
  const [md5Result, setMd5Result] = useState('');

  // Password entropy state
  const [testPassword, setTestPassword] = useState('Tr0ub4dor&3#99');
  const [pwdAnalysis, setPwdAnalysis] = useState<PasswordAnalysis>(analyzePassword('Tr0ub4dor&3#99'));

  // Cipher state
  const [cipherInput, setCipherInput] = useState('Confidential Defensive Intelligence 2026');
  const [base64Output, setBase64Output] = useState('');
  const [rot13Output, setRot13Output] = useState('');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const s256 = await computeSha256(hashInput);
      const s512 = await computeSha512(hashInput);
      const m5 = computeMd5(hashInput);
      if (isMounted) {
        setSha256Result(s256);
        setSha512Result(s512);
        setMd5Result(m5);
      }
    })();
    return () => { isMounted = false; };
  }, [hashInput]);

  useEffect(() => {
    setPwdAnalysis(analyzePassword(testPassword));
  }, [testPassword]);

  useEffect(() => {
    setBase64Output(encodeBase64(cipherInput));
    setRot13Output(rot13(cipherInput));
  }, [cipherInput]);

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    soundFX.playKeyClick();
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="flex flex-col gap-6 font-mono text-xs">
      {/* Top Banner */}
      <div className="bg-[#040e07] border border-emerald-600/50 rounded-lg p-5 glow-box-green">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-400" />
              CRYPTOGRAPHIC ENCLAVE & RESILIENCE LAB
            </h2>
            <p className="text-xs text-emerald-500/80 mt-0.5">
              Generate cryptographic digests, analyze password entropy against GPU clusters, and test encoding vectors.
            </p>
          </div>
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded border border-emerald-900">
            <button
              onClick={() => setActiveTab('hash')}
              className={`px-3 py-1.5 rounded transition-all ${
                activeTab === 'hash' ? 'bg-emerald-600 text-black font-bold' : 'text-emerald-400 hover:text-emerald-200'
              }`}
            >
              Hash Digests
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-3 py-1.5 rounded transition-all ${
                activeTab === 'password' ? 'bg-emerald-600 text-black font-bold' : 'text-emerald-400 hover:text-emerald-200'
              }`}
            >
              Password Entropy
            </button>
            <button
              onClick={() => setActiveTab('ciphers')}
              className={`px-3 py-1.5 rounded transition-all ${
                activeTab === 'ciphers' ? 'bg-emerald-600 text-black font-bold' : 'text-emerald-400 hover:text-emerald-200'
              }`}
            >
              Base64 & Ciphers
            </button>
          </div>
        </div>
      </div>

      {/* Tab: Hashes */}
      {activeTab === 'hash' && (
        <div className="space-y-4">
          <div className="bg-[#030805] border border-emerald-800/60 rounded-lg p-5">
            <label className="text-[11px] text-emerald-400/80 uppercase font-bold block mb-2">
              Input Plaintext / Token / Secret Payload:
            </label>
            <input
              type="text"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="Type string to generate cryptographic hashes..."
              className="w-full bg-black/80 border border-emerald-700/80 rounded px-3 py-2 text-emerald-200 text-sm focus:border-emerald-400 focus:outline-none"
            />
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 gap-4">
            {/* SHA-256 */}
            <div className="bg-[#040e07] border border-emerald-700/60 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-emerald-400" />
                  SHA-256 (NIST Secure Standard)
                </span>
                <button
                  onClick={() => copyText('sha256', sha256Result)}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[11px]"
                >
                  {copiedId === 'sha256' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'sha256' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2.5 bg-black/80 rounded border border-emerald-900/60 text-emerald-300 break-all select-all">
                {sha256Result}
              </div>
              <p className="text-[10px] text-emerald-500/70 mt-1.5">
                Collision-resistant 256-bit cryptographic digest recommended for digital signatures, blockchain, and storage integrity.
              </p>
            </div>

            {/* SHA-512 */}
            <div className="bg-[#040e07] border border-emerald-700/60 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-emerald-400" />
                  SHA-512 (High-Assurance Digest)
                </span>
                <button
                  onClick={() => copyText('sha512', sha512Result)}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[11px]"
                >
                  {copiedId === 'sha512' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'sha512' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2.5 bg-black/80 rounded border border-emerald-900/60 text-emerald-300 break-all select-all max-h-24 overflow-y-auto">
                {sha512Result}
              </div>
            </div>

            {/* MD5 */}
            <div className="bg-[#040e07] border border-amber-800/60 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-amber-400" />
                  MD5 (Legacy / Cryptographically Broken)
                </span>
                <button
                  onClick={() => copyText('md5', md5Result)}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-amber-950/60 hover:bg-amber-900 border border-amber-800 text-amber-300 text-[11px]"
                >
                  {copiedId === 'md5' ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'md5' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2.5 bg-black/80 rounded border border-amber-900/60 text-amber-300 break-all select-all">
                {md5Result}
              </div>
              <p className="text-[10px] text-amber-500/80 mt-1.5">
                WARNING: MD5 is vulnerable to rapid collision attacks and rainbow table lookups. Never store user credentials using raw MD5.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Password Entropy & Cracking Simulator */}
      {activeTab === 'password' && (
        <div className="space-y-5">
          <div className="bg-[#030805] border border-emerald-800/60 rounded-lg p-5">
            <label className="text-[11px] text-emerald-400/80 uppercase font-bold block mb-2">
              Test Password / Credential Strength:
            </label>
            <div className="relative">
              <input
                type="text"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-black/80 border border-emerald-700/80 rounded px-3 py-2 text-emerald-200 text-sm focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-[#040e07] border border-emerald-800/60">
              <span className="text-[11px] text-emerald-500/70 uppercase">Information Entropy</span>
              <span className="text-2xl font-bold text-emerald-300 block mt-1">
                {pwdAnalysis.entropyBits} bits
              </span>
              <span className="text-[10px] text-emerald-500/70 mt-1 block">
                Target: &gt;64 bits for standard, &gt;80 bits for high-value root
              </span>
            </div>

            <div className="p-4 rounded-lg bg-[#040e07] border border-emerald-800/60">
              <span className="text-[11px] text-emerald-500/70 uppercase">Resilience Tier</span>
              <span className={`text-2xl font-bold block mt-1 ${
                pwdAnalysis.strength === 'VERY_STRONG' || pwdAnalysis.strength === 'STRONG'
                  ? 'text-emerald-400'
                  : pwdAnalysis.strength === 'MODERATE'
                  ? 'text-cyan-400'
                  : 'text-red-400'
              }`}>
                {pwdAnalysis.strength.replace('_', ' ')}
              </span>
              <span className="text-[10px] text-emerald-500/70 mt-1 block">
                NIST SP 800-63B Compliance Model
              </span>
            </div>

            <div className="p-4 rounded-lg bg-[#040e07] border border-emerald-800/60">
              <span className="text-[11px] text-emerald-500/70 uppercase">Est. GPU Offline Crack Time</span>
              <span className="text-lg font-bold text-emerald-300 block mt-1">
                {pwdAnalysis.crackTimeEstimate}
              </span>
              <span className="text-[10px] text-emerald-500/70 mt-1 block">
                Calculated on Hashcat 8x RTX 4090 cluster (350 GH/s)
              </span>
            </div>
          </div>

          <div className="bg-[#030805] border border-emerald-800/60 rounded-lg p-5">
            <h4 className="text-sm font-bold text-emerald-300 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Cryptographic Hardening Recommendations
            </h4>
            <ul className="space-y-1.5 text-emerald-400/90 text-xs">
              {pwdAnalysis.feedback.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab: Base64 & Ciphers */}
      {activeTab === 'ciphers' && (
        <div className="space-y-4">
          <div className="bg-[#030805] border border-emerald-800/60 rounded-lg p-5">
            <label className="text-[11px] text-emerald-400/80 uppercase font-bold block mb-2">
              Payload to Encode / Transform:
            </label>
            <input
              type="text"
              value={cipherInput}
              onChange={(e) => setCipherInput(e.target.value)}
              className="w-full bg-black/80 border border-emerald-700/80 rounded px-3 py-2 text-emerald-200 text-sm focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Base64 */}
            <div className="bg-[#040e07] border border-emerald-700/60 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-emerald-300 text-sm">Base64 Encoded</span>
                <button
                  onClick={() => copyText('b64', base64Output)}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-[11px]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
              <div className="p-2.5 bg-black/80 rounded border border-emerald-900/60 text-emerald-300 break-all select-all">
                {base64Output}
              </div>
            </div>

            {/* ROT13 */}
            <div className="bg-[#040e07] border border-emerald-700/60 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-emerald-300 text-sm">ROT13 / Substitution Cipher</span>
                <button
                  onClick={() => copyText('rot13', rot13Output)}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-[11px]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
              <div className="p-2.5 bg-black/80 rounded border border-emerald-900/60 text-emerald-300 break-all select-all">
                {rot13Output}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
