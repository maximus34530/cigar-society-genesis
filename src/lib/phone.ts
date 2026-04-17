export function normalizePhoneE164Like(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const digitsOnly = trimmed.replace(/[^\d+]/g, "");

  // If already +<digits>, validate length.
  if (digitsOnly.startsWith("+")) {
    const rest = digitsOnly.slice(1);
    if (!/^\d{10,15}$/.test(rest)) return null;
    return `+${rest}`;
  }

  // Otherwise treat as digits.
  const digits = digitsOnly.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`; // US default
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length >= 10 && digits.length <= 15) return `+${digits}`;
  return null;
}

export function formatPhoneForDisplay(e164Like: string | null | undefined): string {
  const v = (e164Like ?? "").trim();
  if (!v) return "";
  return v;
}

