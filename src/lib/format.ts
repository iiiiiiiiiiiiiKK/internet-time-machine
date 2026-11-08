/**
 * Date / URL / number formatting helpers.
 * Everything here is pure and unit-testable.
 */

export const TS_LEN = 14;

export function parseTs(ts: string): { y: number; mo: number; d: number; hh: number; mi: number; ss: number } | null {
  if (!ts || ts.length < 8) return null;
  const y = Number(ts.slice(0, 4));
  const mo = Number(ts.slice(4, 6));
  const d = Number(ts.slice(6, 8));
  const hh = Number(ts.slice(8, 10) || 0);
  const mi = Number(ts.slice(10, 12) || 0);
  const ss = Number(ts.slice(12, 14) || 0);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
  if (y < 1990 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return { y, mo, d, hh, mi, ss };
}

export function tsToIsoDate(ts: string): string {
  const p = parseTs(ts);
  if (!p) return '';
  return `${p.y.toString().padStart(4, '0')}-${String(p.mo).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`;
}

export function tsToEpoch(ts: string): number {
  const p = parseTs(ts);
  if (!p) return 0;
  return Date.UTC(p.y, p.mo - 1, p.d, p.hh, p.mi, p.ss);
}

export function tsToDayTs(ts: string): string {
  const p = parseTs(ts);
  if (!p) return ts;
  return `${p.y}${String(p.mo).padStart(2, '0')}${String(p.d).padStart(2, '0')}000000`;
}

export function toDay(ts: string): { timestamp: string; date: string; epoch: number } {
  const dayTs = tsToDayTs(ts);
  return {
    timestamp: dayTs,
    date: tsToIsoDate(dayTs),
    epoch: tsToEpoch(dayTs),
  };
}

export function formatDateHuman(ts: string, lang: string): string {
  const p = parseTs(ts);
  if (!p) return '—';
  if (lang === 'zh') return `${p.y} 年 ${p.mo} 月 ${p.d} 日`;
  return `${p.y}-${String(p.mo).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`;
}

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (n < 1000) return String(n);
  if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  if (n < 1_000_000) return Math.round(n / 1000) + 'K';
  return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
}

const PRIVATE_HOST =
  /^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?|.*\.local)$/i;

export interface NormalizedTarget {
  ok: true;
  host: string;
  /** e.g. https://example.com/ */
  url: string;
  /** display domain (no www, no port) */
  display: string;
}

export interface NormalizeError {
  ok: false;
  reason: 'empty' | 'private' | 'bad-host' | 'bad-url';
}

export function stripWww(host: string): string {
  return host.replace(/^www\./i, '');
}

/** Accepts "google.com", "http://google.com/x", "https://www.google.com". */
export function normalizeInput(raw: string): NormalizedTarget | NormalizeError {
  const input = (raw || '').trim();
  if (!input) return { ok: false, reason: 'empty' };
  if (input.length > 2048) return { ok: false, reason: 'bad-url' };

  let candidate = input;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(candidate)) {
    candidate = 'https://' + candidate;
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return { ok: false, reason: 'bad-url' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, reason: 'bad-url' };
  }

  const host = parsed.hostname.toLowerCase();
  if (!host) return { ok: false, reason: 'bad-host' };
  if (PRIVATE_HOST.test(host)) return { ok: false, reason: 'private' };
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    const first = Number(host.split('.')[0]);
    if (first === 10 || first === 127 || first === 0 || first >= 224) {
      return { ok: false, reason: 'private' };
    }
  }
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(host)) {
    return { ok: false, reason: 'bad-host' };
  }
  if (host.split('.').length < 2) return { ok: false, reason: 'bad-host' };
  const tld = host.split('.').pop() || '';
  if (tld.length < 2) return { ok: false, reason: 'bad-host' };

  parsed.hash = '';
  parsed.username = '';
  parsed.password = '';

  return {
    ok: true,
    host,
    url: parsed.toString(),
    display: stripWww(host),
  };
}

/** Compact relative time: 3s / 4m / 2h / 5d */
export function timeAgo(epochMs: number, lang: string): string {
  const diff = Date.now() - epochMs;
  if (diff < 0) return lang === 'zh' ? '刚刚' : 'just now';
  const s = Math.floor(diff / 1000);
  if (s < 60) return lang === 'zh' ? `${s} 秒前` : `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return lang === 'zh' ? `${m} 分钟前` : `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return lang === 'zh' ? `${h} 小时前` : `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return lang === 'zh' ? `${d} 天前` : `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return lang === 'zh' ? `${mo} 个月前` : `${mo}mo ago`;
  const y = Math.floor(mo / 12);
  return lang === 'zh' ? `${y} 年前` : `${y}y ago`;
}

export function yearRange(start: number, end: number): number[] {
  const out: number[] = [];
  for (let y = start; y <= end; y += 1) out.push(y);
  return out;
}