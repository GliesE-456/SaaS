import dns from 'dns/promises';

// ─── SSRF Blocklist ──────────────────────────────────────────────────────────
// Covers RFC 1918, loopback, link-local, APIPA, shared, and TEST-NETs
// Also covers IPv6 loopback, unique-local, and link-local

interface Cidr {
  start: number[];
  mask: number;
}

const BLOCKED_CIDRS: Cidr[] = [
  { start: [10, 0, 0, 0], mask: 8 },         // RFC 1918
  { start: [172, 16, 0, 0], mask: 12 },       // RFC 1918
  { start: [192, 168, 0, 0], mask: 16 },      // RFC 1918
  { start: [127, 0, 0, 0], mask: 8 },         // Loopback
  { start: [169, 254, 0, 0], mask: 16 },      // Link-local / APIPA (AWS metadata)
  { start: [100, 64, 0, 0], mask: 10 },       // Shared address space (RFC 6598)
  { start: [0, 0, 0, 0], mask: 8 },           // Current network
  { start: [192, 0, 2, 0], mask: 24 },        // TEST-NET-1
  { start: [198, 51, 100, 0], mask: 24 },     // TEST-NET-2
  { start: [203, 0, 113, 0], mask: 24 },      // TEST-NET-3
  { start: [240, 0, 0, 0], mask: 4 },         // Reserved
];

const BLOCKED_IPV6_PREFIXES = [
  '::1',     // Loopback
  'fc',      // Unique local (fc00::/7)
  'fd',      // Unique local (fc00::/7)
  'fe80',    // Link-local (fe80::/10)
];

function isIpv4Blocked(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // Malformed → block
  }
  const ipInt =
    (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];

  for (const cidr of BLOCKED_CIDRS) {
    const shift = 32 - cidr.mask;
    const startInt =
      (cidr.start[0] << 24) |
      (cidr.start[1] << 16) |
      (cidr.start[2] << 8) |
      cidr.start[3];
    if ((ipInt >>> shift) === (startInt >>> shift)) return true;
  }
  return false;
}

function isIpv6Blocked(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === '::1') return true;
  for (const prefix of BLOCKED_IPV6_PREFIXES) {
    if (lower.startsWith(prefix)) return true;
  }
  // IPv4-mapped (::ffff:10.0.0.1)
  if (lower.startsWith('::ffff:')) {
    const v4 = lower.replace('::ffff:', '');
    return isIpv4Blocked(v4);
  }
  return false;
}

function isIpBlocked(ip: string): boolean {
  return ip.includes(':') ? isIpv6Blocked(ip) : isIpv4Blocked(ip);
}

// ─── Validation Error ─────────────────────────────────────────────────────────

export class SsrfError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SsrfError';
  }
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export async function validateExternalUrl(rawUrl: string): Promise<void> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new SsrfError('Invalid URL format');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new SsrfError('Only HTTP/HTTPS URLs are allowed');
  }

  if (parsed.port && !['', '80', '443'].includes(parsed.port)) {
    throw new SsrfError('Non-standard ports are not allowed');
  }

  // Resolve both A and AAAA to catch all addresses (prevents CNAME chains)
  const [ipv4Result, ipv6Result] = await Promise.allSettled([
    dns.resolve4(parsed.hostname),
    dns.resolve6(parsed.hostname),
  ]);

  const allIps = [
    ...(ipv4Result.status === 'fulfilled' ? ipv4Result.value : []),
    ...(ipv6Result.status === 'fulfilled' ? ipv6Result.value : []),
  ];

  if (allIps.length === 0) {
    throw new SsrfError(`Cannot resolve hostname: ${parsed.hostname}`);
  }

  for (const ip of allIps) {
    if (isIpBlocked(ip)) {
      throw new SsrfError(
        'URL resolves to a private or reserved IP address. Internal URLs cannot be tracked.',
      );
    }
  }
}
