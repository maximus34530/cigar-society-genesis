export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function handleOptions(): Response {
  return new Response("ok", { headers: corsHeaders });
}

export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(corsHeaders);
  headers.set("Content-Type", "application/json");
  if (init.headers) {
    new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  }
  return new Response(JSON.stringify(data), { ...init, headers });
}
