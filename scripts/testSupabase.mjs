const url = process.env.VITE_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey =
  process.env.VITE_SUPABASE_ANON_KEY ??
  process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!url || !anonKey) {
  console.error(
    "Missing env. Set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (preferred) or VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY, or NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY in .env.local, then run: npm run test:supabase",
  );
  process.exit(1);
}

async function main() {
  const authHealth = await fetch(`${url}/auth/v1/health`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });
  if (!authHealth.ok) {
    throw new Error(`Auth health check failed: ${authHealth.status} ${authHealth.statusText}`);
  }

  // Note: some projects forbid fetching the OpenAPI schema unless using a secret key.
  // Instead, ping a known table endpoint and treat 401/403 as "reachable but blocked by RLS".
  const postgrestPing = await fetch(`${url}/rest/v1/events?select=id&limit=1`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Accept: "application/json",
    },
  });

  if (postgrestPing.ok) {
    console.log("Supabase connection OK (PostgREST reachable, events readable).");
    return;
  }

  if (postgrestPing.status === 401 || postgrestPing.status === 403) {
    console.log(
      `Supabase connection OK (PostgREST reachable, but access blocked: ${postgrestPing.status} ${postgrestPing.statusText}).`,
    );
    console.log("If you expect reads to work, add RLS policies for the anon/publishable role.");
    return;
  }

  const text = await postgrestPing.text().catch(() => "");
  throw new Error(
    `PostgREST check failed: ${postgrestPing.status} ${postgrestPing.statusText}${text ? `\n${text}` : ""}`,
  );

}

main().catch((err) => {
  console.error(err?.stack ?? String(err));
  process.exit(1);
});

