import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";
import { createContext, useEffect, useMemo, useState } from "react";

export type ProfileRole = "admin" | "client" | "user";

export type Profile = {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: ProfileRole;
};

type AuthContextValue = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  profileError: string | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const primary = await supabase
    .from("profiles")
    .select("id, full_name, first_name, last_name, phone, avatar_url, role")
    .eq("id", userId)
    .maybeSingle();

  if (!primary.error) {
    return (primary.data as Profile | null) ?? null;
  }

  // Back-compat: if migrations haven't been applied yet (missing columns), fall back to legacy select.
  const msg = primary.error.message ?? "";
  const looksLikeMissingColumn =
    msg.toLowerCase().includes("column") &&
    (msg.includes("first_name") || msg.includes("last_name") || msg.includes("phone"));

  if (!looksLikeMissingColumn) throw primary.error;

  const legacy = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role")
    .eq("id", userId)
    .maybeSingle();

  if (legacy.error) throw legacy.error;
  const row = (legacy.data as Omit<Profile, "first_name" | "last_name" | "phone"> | null) ?? null;
  if (!row) return null;
  return {
    ...row,
    first_name: null,
    last_name: null,
    phone: null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const user = session?.user ?? null;

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      setProfileError(null);
      return;
    }

    try {
      const next = await fetchProfile(user.id);
      setProfile(next);
      setProfileError(null);
    } catch (e) {
      setProfile(null);
      setProfileError(e instanceof Error ? e.message : "Failed to load profile");
    }
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        if (!user) {
          setProfile(null);
          setProfileError(null);
          return;
        }
        try {
          const next = await fetchProfile(user.id);
          if (!cancelled) {
            setProfile(next);
            setProfileError(null);
          }
        } catch (e) {
          if (!cancelled) {
            setProfile(null);
            setProfileError(e instanceof Error ? e.message : "Failed to load profile");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      session,
      user,
      profile,
      profileError,
      refreshProfile,
      signOut: async () => {
        await supabase.auth.signOut();
      },
      isAdmin: String(profile?.role ?? "")
        .trim()
        .toLowerCase() === "admin",
    }),
    [loading, session, user, profile, profileError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

