import React, { useState } from 'react';
import { PortInfo } from '../types';
import { soundFX } from '../utils/audio';
import { 
  Network, 
  ShieldAlert, 
  ShieldCheck, 
  Copy, 
  Check, 
  Search, 
  RefreshCw,
  Server
} from 'lucide-react';

const COMMON_PORTS: PortInfo[] = [
  {
    port: 21,
    service: 'FTP (File Transfer Protocol)',
    transport: 'TCP',
    status: 'EXPOSED',
    commonVulnerability: 'Anonymous login, cleartext credential transmission, directory traversal.',
    hardeningRule: `// Disable anonymous FTP & enforce FTPS:\nanonymous_enable=NO\nssl_enable=YES\nallow_anon_ssl=NO\nforce_local_data_ssl=YES`
  },
  {
    port: 22,
    service: 'SSH (Secure Shell)',
    transport: 'TCP',
    status: 'SECURED',
    commonVulnerability: 'Brute-force credential stuffing, outdated OpenSSH CVEs, root password login.',
    hardeningRule: `// Hardened /etc/ssh/sshd_config:\nPermitRootLogin no\nPasswordAuthentication no\nPubkeyAuthentication yes\nMaxAuthTries 3\nAllowAgentForwarding no`
  },
  {
    port: 23,
    service: 'Telnet',
    transport: 'TCP',
    status: 'EXPOSED',
    commonVulnerability: 'Cleartext protocol with no encryption. Vulnerable to packet sniffing and MitM hijacking.',
    hardeningRule: `// Disable Telnet completely & close port:\nsudo systemctl stop inetd\nsudo systemctl disable inetd\nsudo ufw deny 23/tcp`
  },
  {
    port: 80,
    service: 'HTTP (Unencrypted Web)',
    transport: 'TCP',
    status: 'FILTERED',
    commonVulnerability: 'Man-in-the-Middle credential interception, cookie hijacking without Secure flag.',
    hardeningRule: `// Enforce immediate 301 Permanent Redirect to HTTPS:\nserver {\n  listen 80 default_server;\n  return 301 https://$host$request_uri;\n}`
  },
  {
    port: 443,
    service: 'HTTPS (TLS Web Traffic)',
    transport: 'TCP',
    status: 'SECURED',
    commonVulnerability: 'Weak SSL/TLS cipher suites (RC4, 3DES), lack of HSTS, expired certificates.',
    hardeningRule: `// Nginx TLS 1.3 only configuration:\nssl_protocols TLSv1.2 TLSv1.3;\nssl_prefer_server_ciphers off;\nssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;`
  },
  {
    port: 3306,
    service: 'MySQL Database',
    transport: 'TCP',
    status: 'EXPOSED',
    commonVulnerability: 'Direct public internet exposure, unauthorized database dumps, CVE-2012-2122.',
    hardeningRule: `// Bind strictly to localhost loopback in /etc/mysql/my.cnf:\nbind-address = 127.0.0.1\n\n// UFW Firewall Rule:\nsudo ufw deny 3306`
  },
  {
    port: 6379,
    service: 'Redis In-Memory Store',
    transport: 'TCP',
    status: 'EXPOSED',
    commonVulnerability: 'Unauthenticated remote code execution via unauthorized CONFIG SET / writable SSH keys.',
    hardeningRule: `// In redis.conf:\nbind 127.0.0.1\nprotected-mode yes\nrequirepass <GENERATE_LONG_SECURE_PASSWORD>`
  },
  {
    port: 27017,
    service: 'MongoDB Database',
    transport: 'TCP',
    status: 'EXPOSED',
    commonVulnerability: 'Default installations without auth enabled; automated ransomware wipe attacks.',
    hardeningRule: `// In /etc/mongod.conf:\nnet:\n  bindIp: 127.0.0.1\nsecurity:\n  authorization: enabled`
  }
];

export const PortScannerView: React.FC = () => {
  const [ports, setPorts] = useState<PortInfo[]>(COMMON_PORTS);
  const [filter, setFilter] = useState('');
  const [scanning, setScanning] = useState(false);
  const [copiedPort, setCopiedPort] = useState<number | null>(null);

  const handleRescan = () => {
    soundFX.playScanBeep();
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      soundFX.playAccessGranted();
    }, 800);
  };

  const handleCopy = (port: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPort(port);
    soundFX.playKeyClick();
    setTimeout(() => setCopiedPort(null), 2000);
  };

  const filteredPorts = ports.filter(
    (p) =>
      p.service.toLowerCase().includes(filter.toLowerCase()) ||
      p.port.toString().includes(filter) ||
      p.status.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 font-mono text-xs">
      <div className="bg-[#040e07] border border-emerald-600/50 rounded-lg p-5 glow-box-green">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
              <Network className="w-5 h-5 text-emerald-400" />
              PORT ATTACK SURFACE & FIREWALL HARDENING MATRIX
            </h2>
            <p className="text-xs text-emerald-500/80 mt-0.5">
              Inspect commonly exploited daemon ports, identify threat vectors, and apply production firewall rules.
            </p>
          </div>
          <button
            onClick={handleRescan}
            disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-black font-bold text-xs shadow-md transition-all self-start md:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            <span>{scanning ? 'Auditing Daemon Ports...' : 'Simulate Port Scan'}</span>
          </button>
        </div>

        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search port number (e.g. 22, 3306), service name, or status..."
            className="w-full bg-black/80 border border-emerald-700/80 rounded pl-9 pr-4 py-2 text-emerald-200 text-xs focus:border-emerald-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Port Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPorts.map((item) => (
          <div
            key={item.port}
            className={`p-4 rounded-lg border bg-[#030805] flex flex-col justify-between ${
              item.status === 'EXPOSED'
                ? 'border-red-900/60'
                : item.status === 'SECURED'
                ? 'border-emerald-800/60'
                : 'border-amber-800/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-emerald-950 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-emerald-300">
                    PORT {item.port} <span className="text-xs text-emerald-500 font-normal">/{item.transport}</span>
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.status === 'EXPOSED'
                      ? 'bg-red-950 text-red-300 border border-red-700'
                      : item.status === 'SECURED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : 'bg-amber-950 text-amber-300 border border-amber-700'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <span className="text-emerald-200 font-bold block mb-1">{item.service}</span>
              
              <div className="mb-3">
                <span className="text-[10px] text-emerald-500/70 uppercase block font-bold">Known Attack Exposure:</span>
                <p className="text-emerald-400/80 text-[11px] mt-0.5">{item.commonVulnerability}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between bg-emerald-950/60 px-2.5 py-1 rounded-t border-t border-x border-emerald-800/50">
                <span className="text-[10px] text-emerald-300 font-bold">Hardening Rule & Config:</span>
                <button
                  onClick={() => handleCopy(item.port, item.hardeningRule)}
                  className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-200"
                >
                  {copiedPort === item.port ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPort === item.port ? 'Copied' : 'Copy Rule'}</span>
                </button>
              </div>
              <pre className="p-2.5 bg-black/90 rounded-b border border-emerald-800/50 text-emerald-300 overflow-x-auto text-[10px] leading-tight">
                {item.hardeningRule}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
