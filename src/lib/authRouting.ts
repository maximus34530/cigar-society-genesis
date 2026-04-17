import { supabase } from "@/lib/supabase";

/** Default when user has no `state.from` (e.g. opened Log in from navbar). */
export const DEFAULT_POST_AUTH_PATH = "/dashboard";

/**
 * Only allow in-app relative paths for post-auth navigation and OAuth stash.
 * Rejects full URLs, `//`, `javascript:`, empty strings; falls back to `/`.
 */
export function sanitizeOAuthReturnPath(input: string | undefined | null): string {
  if (typeof input !== "string") return "/";
  const t = input.trim();
  if (t.length === 0) return "/";
  if (!t.startsWith("/")) return "/";
  if (t.startsWith("//")) return "/";
  return t;
}

const OAUTH_RETURN_PATH_KEY = "cigar_society_oauth_return_path";
const OAUTH_RETURN_TTL_MS = 1000 * 60 * 30;

type OAuthReturnPayload = { path: string; exp: number };

function parseOAuthReturnRaw(raw: string): string | null {
  try {
    const parsed = JSON.parse(raw) as OAuthReturnPayload;
    if (typeof parsed.path === "string" && typeof parsed.exp === "number") {
      if (Date.now() > parsed.exp) {
        try {
          sessionStorage.removeItem(OAUTH_RETURN_PATH_KEY);
        } catch {
          /* ignore */
        }
        return null;
      }
      return sanitizeOAuthReturnPath(parsed.path);
    }
  } catch {
    /* legacy: plain path string */
  }
  if (raw.startsWith("/")) return sanitizeOAuthReturnPath(raw);
  return null;
}

export type EmailSignupReturnPayload = {
  path: string;
  email: string;
  exp: number;
};

const EMAIL_SIGNUP_RETURN_KEY = "cigar_society_email_signup_return";

const EMAIL_SIGNUP_RETURN_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export function resolvePostLoginPath(from: string, isAdmin: boolean): string {
  if (isAdmin) return "/admin";
  return from;
}

export async function resolvePostLoginPathForUser(from: string, userId: string): Promise<string> {
  const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (error) return from;
  const isAdmin = (data as { role?: string } | null)?.role === "admin";
  return resolvePostLoginPath(from, isAdmin);
}

export function stashOAuthReturnPath(path: string): void {
  try {
    const payload: OAuthReturnPayload = {
      path: sanitizeOAuthReturnPath(path),
      exp: Date.now() + OAUTH_RETURN_TTL_MS,
    };
    sessionStorage.setItem(OAUTH_RETURN_PATH_KEY, JSON.stringify(payload));
  } catch {
    /* private mode */
  }
}

/** Read stashed post-OAuth route without consuming (e.g. retry / catch-up redirects). */
export function peekOAuthReturnPath(): string | null {
  try {
    const v = sessionStorage.getItem(OAUTH_RETURN_PATH_KEY);
    if (!v) return null;
    return parseOAuthReturnRaw(v);
  } catch {
    return null;
  }
}

export function takeOAuthReturnPath(): string | null {
  try {
    const v = sessionStorage.getItem(OAUTH_RETURN_PATH_KEY);
    if (!v) return null;
    const path = parseOAuthReturnRaw(v);
    sessionStorage.removeItem(OAUTH_RETURN_PATH_KEY);
    return path;
  } catch {
    try {
      sessionStorage.removeItem(OAUTH_RETURN_PATH_KEY);
    } catch {
      /* ignore */
    }
    return null;
  }
}

export function stashEmailSignupReturnPath(path: string, email: string): void {
  try {
    const payload: EmailSignupReturnPayload = {
      path: sanitizeOAuthReturnPath(path),
      email: email.trim().toLowerCase(),
      exp: Date.now() + EMAIL_SIGNUP_RETURN_TTL_MS,
    };
    sessionStorage.setItem(EMAIL_SIGNUP_RETURN_KEY, JSON.stringify(payload));
  } catch {
    /* private mode */
  }
}

export function takeEmailSignupReturnIfMatchesUser(userEmail: string | undefined): string | null {
  if (!userEmail) return null;
  try {
    const raw = sessionStorage.getItem(EMAIL_SIGNUP_RETURN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EmailSignupReturnPayload;
    if (typeof parsed.path !== "string" || typeof parsed.email !== "string" || typeof parsed.exp !== "number") {
      sessionStorage.removeItem(EMAIL_SIGNUP_RETURN_KEY);
      return null;
    }
    if (Date.now() > parsed.exp) {
      sessionStorage.removeItem(EMAIL_SIGNUP_RETURN_KEY);
      return null;
    }
    if (parsed.email !== userEmail.trim().toLowerCase()) {
      return null;
    }
    sessionStorage.removeItem(EMAIL_SIGNUP_RETURN_KEY);
    return sanitizeOAuthReturnPath(parsed.path);
  } catch {
    try {
      sessionStorage.removeItem(EMAIL_SIGNUP_RETURN_KEY);
    } catch {
      /* ignore */
    }
    return null;
  }
}

export function clearEmailSignupReturnPath(): void {
  try {
    sessionStorage.removeItem(EMAIL_SIGNUP_RETURN_KEY);
  } catch {
    /* ignore */
  }
}
