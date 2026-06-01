export type CompareResult = -1 | 0 | 1;

export function parseSemver(version: string): [number, number, number] | null {
  const m = version.replace(/^v/, '').match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!m) return null;
  return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
}

export function compareSemver(a: string, b: string): CompareResult {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  if (!pa && !pb) return 0;
  if (!pa) return -1;
  if (!pb) return 1;
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
}

export function isGreaterVersion(a: string, b: string): boolean {
  return compareSemver(a, b) === 1;
}

export function isCompatibleWithRange(
  version: string,
  minVersion?: string | null,
  maxVersion?: string | null
): boolean {
  if (minVersion && compareSemver(version, minVersion) < 0) return false;
  if (maxVersion && compareSemver(version, maxVersion) > 0) return false;
  return true;
}

export function satisfiesPeerDep(
  installed: string,
  requiredRange: string
): boolean {
  // Supports ">=1.0.0", "^1.2.0", "~1.2.3", "1.0.0"
  const req = requiredRange.trim();
  if (req.startsWith('>=')) {
    return compareSemver(installed, req.slice(2).trim()) >= 0;
  }
  if (req.startsWith('>')) {
    return compareSemver(installed, req.slice(1).trim()) > 0;
  }
  if (req.startsWith('<=')) {
    return compareSemver(installed, req.slice(2).trim()) <= 0;
  }
  if (req.startsWith('<')) {
    return compareSemver(installed, req.slice(1).trim()) < 0;
  }
  if (req.startsWith('^')) {
    const v = req.slice(1).trim();
    const p = parseSemver(v);
    const i = parseSemver(installed);
    if (!p || !i) return false;
    if (compareSemver(installed, v) < 0) return false;
    // ^1.2.3 means >=1.2.3 <2.0.0
    if (i[0] !== p[0]) return false;
    return true;
  }
  if (req.startsWith('~')) {
    const v = req.slice(1).trim();
    const p = parseSemver(v);
    const i = parseSemver(installed);
    if (!p || !i) return false;
    if (compareSemver(installed, v) < 0) return false;
    if (i[0] !== p[0] || i[1] !== p[1]) return false;
    return true;
  }
  return compareSemver(installed, req) === 0;
}
