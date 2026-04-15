const KEY = "cigar_society_recent_reauth_at";
const TTL_MS = 1000 * 60 * 5;

export function markRecentReauth(): void {
  try {
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function hasRecentReauth(): boolean {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < TTL_MS;
  } catch {
    return false;
  }
}

export function clearRecentReauth(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

