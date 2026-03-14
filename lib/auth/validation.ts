/**
 * Auth request validation: email format, password min length. Contract: api-contracts §3.3.
 */
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: unknown): string | null {
  if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) return null;
  return email.trim().toLowerCase();
}

export function validatePassword(password: unknown): { ok: true } | { ok: false; error: string } {
  if (typeof password !== "string") {
    return { ok: false, error: "Password must be a string" };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` };
  }
  return { ok: true };
}

export function validatePublicDisplayName(name: unknown): string | null {
  if (typeof name !== "string") return null;
  const t = name.trim();
  return t.length > 0 ? t : null;
}
