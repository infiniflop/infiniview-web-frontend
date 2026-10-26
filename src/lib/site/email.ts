/**
 * One pragmatic check shared by the form and the API: something before the @, and a domain made of
 * non-empty dot-separated labels (so `a@b..c`, `a@...` and `name@example.com.` are refused). It does not try
 * to be the RFC grammar; delivery is the real validation.
 */
export const EMAIL_RE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
