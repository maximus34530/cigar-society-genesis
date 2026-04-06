const LS_VERIFIED_UNTIL = "cigar-society-age-verified-until";
const SS_SESSION_OK = "cigar-society-age-session-ok";

/** How long “Remember me” keeps the gate skipped (30 days). */
const REMEMBER_MS = 30 * 24 * 60 * 60 * 1000;

export function isAgeVerified(): boolean {
  try {
    const untilRaw = localStorage.getItem(LS_VERIFIED_UNTIL);
    if (untilRaw) {
      const until = Number(untilRaw);
      if (Number.isFinite(until) && Date.now() < until) {
        return true;
      }
      localStorage.removeItem(LS_VERIFIED_UNTIL);
    }
    return sessionStorage.getItem(SS_SESSION_OK) === "true";
  } catch {
    return false;
  }
}

export function setAgeVerified(remember: boolean): void {
  try {
    if (remember) {
      localStorage.setItem(LS_VERIFIED_UNTIL, String(Date.now() + REMEMBER_MS));
      sessionStorage.removeItem(SS_SESSION_OK);
    } else {
      sessionStorage.setItem(SS_SESSION_OK, "true");
      localStorage.removeItem(LS_VERIFIED_UNTIL);
    }
  } catch {
    // Private mode / blocked storage: in-app state still allows the session.
  }
}
