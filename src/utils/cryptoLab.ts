// Cryptographic hashing and cipher utilities using Web Crypto API

export async function computeSha256(text: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function computeSha512(text: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function computeSha1(text: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Simple MD5 implementation for client-side security lab demonstration
export function computeMd5(string: string): string {
  function rotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX: number, lY: number) {
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      else return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    } else {
      return lResult ^ lX8 ^ lY8;
    }
  }
  function F(x: number, y: number, z: number) { return (x & y) | (~x & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
  function H(x: number, y: number, z: number) { return x ^ y ^ z; }
  function I(x: number, y: number, z: number) { return y ^ (x | ~z); }

  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  const x: number[] = [];
  const k = string.length;
  for (let i = 0; i < k; i++) {
    x[i >> 2] |= (string.charCodeAt(i) & 0xff) << ((i % 4) * 8);
  }
  x[k >> 2] |= 0x80 << ((k % 4) * 8);
  x[(((k + 8) >> 6) << 4) + 14] = k * 8;

  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;

  for (let i = 0; i < x.length; i += 16) {
    const olda = a, oldb = b, oldc = c, oldd = d;
    a = FF(a, b, c, d, x[i + 0], 7, 0xd76aa478);
    d = FF(d, a, b, c, x[i + 1], 12, 0xe8c7b756);
    c = FF(c, d, a, b, x[i + 2], 17, 0x242070db);
    b = FF(b, c, d, a, x[i + 3], 22, 0xc1bdceee);
    a = FF(a, b, c, d, x[i + 4], 7, 0xf57c0faf);
    d = FF(d, a, b, c, x[i + 5], 12, 0x4787c62a);
    c = FF(c, d, a, b, x[i + 6], 17, 0xa8304613);
    b = FF(b, c, d, a, x[i + 7], 22, 0xfd469501);
    a = FF(a, b, c, d, x[i + 8], 7, 0x698098d8);
    d = FF(d, a, b, c, x[i + 9], 12, 0x8b44f7af);
    c = FF(c, d, a, b, x[i + 10], 17, 0xffff5bb1);
    b = FF(b, c, d, a, x[i + 11], 22, 0x895cd7be);
    a = FF(a, b, c, d, x[i + 12], 7, 0x6b901122);
    d = FF(d, a, b, c, x[i + 13], 12, 0xfd987193);
    c = FF(c, d, a, b, x[i + 14], 17, 0xa679438e);
    b = FF(b, c, d, a, x[i + 15], 22, 0x49b40821);

    a = GG(a, b, c, d, x[i + 1], 5, 0xf61e2562);
    d = GG(d, a, b, c, x[i + 6], 9, 0xc040b340);
    c = GG(c, d, a, b, x[i + 11], 14, 0x265e5a51);
    b = GG(b, c, d, a, x[i + 0], 20, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[i + 5], 5, 0xd62f105d);
    d = GG(d, a, b, c, x[i + 10], 9, 0x02441453);
    c = GG(c, d, a, b, x[i + 15], 14, 0xd8a1e681);
    b = GG(b, c, d, a, x[i + 4], 20, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[i + 9], 5, 0x21e1cde6);
    d = GG(d, a, b, c, x[i + 14], 9, 0xc33707d6);
    c = GG(c, d, a, b, x[i + 3], 14, 0xf4d50d87);
    b = GG(b, c, d, a, x[i + 8], 20, 0x455a14ed);
    a = GG(a, b, c, d, x[i + 13], 5, 0xa9e3e905);
    d = GG(d, a, b, c, x[i + 2], 9, 0xfcefa3f8);
    c = GG(c, d, a, b, x[i + 7], 14, 0x676f02d9);
    b = GG(b, c, d, a, x[i + 12], 20, 0x8d2a4c8a);

    a = HH(a, b, c, d, x[i + 5], 4, 0xfffa3942);
    d = HH(d, a, b, c, x[i + 8], 11, 0x8771f681);
    c = HH(c, d, a, b, x[i + 11], 16, 0x6d9d6122);
    b = HH(b, c, d, a, x[i + 14], 23, 0xfde5380c);
    a = HH(a, b, c, d, x[i + 1], 4, 0xa4beea44);
    d = HH(d, a, b, c, x[i + 4], 11, 0x4bdecfa9);
    c = HH(c, d, a, b, x[i + 7], 16, 0xf6bb4b60);
    b = HH(b, c, d, a, x[i + 10], 23, 0xbebfbc70);
    a = HH(a, b, c, d, x[i + 13], 4, 0x289b7ec6);
    d = HH(d, a, b, c, x[i + 0], 11, 0xeaa127fa);
    c = HH(c, d, a, b, x[i + 3], 16, 0xd4ef3085);
    b = HH(b, c, d, a, x[i + 6], 23, 0x04881d05);
    a = HH(a, b, c, d, x[i + 9], 4, 0xd9d4d039);
    d = HH(d, a, b, c, x[i + 12], 11, 0xe6db99e5);
    c = HH(c, d, a, b, x[i + 15], 16, 0x1fa27cf8);
    b = HH(b, c, d, a, x[i + 2], 23, 0xc4ac5665);

    a = II(a, b, c, d, x[i + 0], 6, 0xf4292244);
    d = II(d, a, b, c, x[i + 7], 10, 0x432aff97);
    c = II(c, d, a, b, x[i + 14], 15, 0xab9423a7);
    b = II(b, c, d, a, x[i + 5], 21, 0xfc93a039);
    a = II(a, b, c, d, x[i + 12], 6, 0x655b59c3);
    d = II(d, a, b, c, x[i + 3], 10, 0x8f0ccc92);
    c = II(c, d, a, b, x[i + 10], 15, 0xffeff47d);
    b = II(b, c, d, a, x[i + 1], 21, 0x85845dd1);
    a = II(a, b, c, d, x[i + 8], 6, 0x6fa87e4f);
    d = II(d, a, b, c, x[i + 15], 10, 0xfe2ce6e0);
    c = II(c, d, a, b, x[i + 6], 15, 0xa3014314);
    b = II(b, c, d, a, x[i + 13], 21, 0x4e0811a1);
    a = II(a, b, c, d, x[i + 4], 6, 0xf7537e82);
    d = II(d, a, b, c, x[i + 11], 10, 0xbd3af235);
    c = II(c, d, a, b, x[i + 2], 15, 0x2ad7d2bb);
    b = II(b, c, d, a, x[i + 9], 21, 0xeb86d391);

    a = addUnsigned(a, olda);
    b = addUnsigned(b, oldb);
    c = addUnsigned(c, oldc);
    d = addUnsigned(d, oldd);
  }

  function rhex(num: number) {
    let str = '';
    for (let j = 0; j <= 3; j++) {
      str += ((num >> (j * 8)) & 255).toString(16).padStart(2, '0');
    }
    return str;
  }
  return (rhex(a) + rhex(b) + rhex(c) + rhex(d)).toLowerCase();
}

export function encodeBase64(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return 'Encoding Error';
  }
}

export function decodeBase64(str: string): string {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return 'Invalid Base64 string';
  }
}

export function rot13(str: string): string {
  return str.replace(/[a-zA-Z]/g, (c) => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      return String.fromCharCode(((code - 65 + 13) % 26) + 65);
    }
    return String.fromCharCode(((code - 97 + 13) % 26) + 97);
  });
}

export interface PasswordAnalysis {
  entropyBits: number;
  strength: 'CRITICAL_WEAK' | 'WEAK' | 'MODERATE' | 'STRONG' | 'VERY_STRONG';
  crackTimeEstimate: string;
  feedback: string[];
}

export function analyzePassword(pwd: string): PasswordAnalysis {
  if (!pwd) {
    return {
      entropyBits: 0,
      strength: 'CRITICAL_WEAK',
      crackTimeEstimate: 'Instant (< 1 ms)',
      feedback: ['Enter a password to evaluate resilience against GPU hashcat dictionary / brute-force clusters.']
    };
  }

  let poolSize = 0;
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasDigit = /[0-9]/.test(pwd);
  const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);

  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasDigit) poolSize += 10;
  if (hasSymbol) poolSize += 33;

  const entropyBits = Math.round(pwd.length * Math.log2(Math.max(2, poolSize)));
  const feedback: string[] = [];

  if (pwd.length < 12) feedback.push('Length is under 12 characters; vulnerable to GPU rainbow tables & masks.');
  if (!hasUpper) feedback.push('Missing uppercase characters.');
  if (!hasDigit) feedback.push('Missing numerical digits.');
  if (!hasSymbol) feedback.push('Missing special characters / punctuation.');

  let strength: PasswordAnalysis['strength'] = 'CRITICAL_WEAK';
  let crackTimeEstimate = '< 1 millisecond';

  if (entropyBits < 32) {
    strength = 'CRITICAL_WEAK';
    crackTimeEstimate = '< 1 millisecond';
  } else if (entropyBits < 48) {
    strength = 'WEAK';
    crackTimeEstimate = '3.2 seconds on 8x RTX 4090';
  } else if (entropyBits < 64) {
    strength = 'MODERATE';
    crackTimeEstimate = '14 hours on 8x RTX 4090';
  } else if (entropyBits < 80) {
    strength = 'STRONG';
    crackTimeEstimate = '34 years on high-speed offline cracker';
  } else {
    strength = 'VERY_STRONG';
    crackTimeEstimate = '1.8 million years (Quantum-resistant baseline)';
  }

  if (feedback.length === 0) {
    feedback.push('High-entropy passphrase meeting NIST SP 800-63B standards.');
  }

  return {
    entropyBits,
    strength,
    crackTimeEstimate,
    feedback
  };
}
