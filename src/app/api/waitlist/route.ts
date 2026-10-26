import { neon } from "@neondatabase/serverless";
import { EMAIL_RE } from "@/lib/site/email";

// Neon HTTP driver works on the default Node.js (Fluid Compute) runtime.
// Prefer co-locating the Vercel project/function region with the Neon DB (e.g. iad1).

const MAX_BODY_BYTES = 2048;

// Best-effort abuse brake. State lives per warm function instance, so this blunts a single client
// hammering the endpoint but is NOT a durable limit: sustained abuse needs edge rate limiting
// (e.g. a Vercel WAF rate-limit rule on POST /api/waitlist) and/or a bot challenge.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 8;
const MAX_TRACKED = 5000; // distinct clients remembered at once
const hits = new Map<string, number[]>(); // insertion order = recency of the last accepted request

function rateLimited(ip: string, now = Date.now()): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  // Only accepted requests are recorded: a client that keeps hammering after a 429 cannot grow its
  // own history (it is capped at MAX_HITS) or make each check more expensive.
  if (recent.length >= MAX_HITS) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.delete(ip); // re-insert so the Map stays ordered oldest → newest
  hits.set(ip, recent);
  // Hard bound on memory: if a flood of distinct addresses fills the map, forget the stalest first.
  while (hits.size > MAX_TRACKED) {
    const oldest = hits.keys().next().value;
    if (oldest === undefined) break;
    hits.delete(oldest);
  }
  return false;
}

// Read at most MAX_BODY_BYTES: a request with no Content-Length (chunked) must not be buffered whole
// before the size check. Returns null once the limit is crossed and cancels the rest of the stream.
async function readLimited(request: Request): Promise<string | null> {
  const reader = request.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

const fail = (error: string, status: number, headers?: HeadersInit) =>
  Response.json({ success: false, error }, { status, headers });

// anything but POST: a clean JSON 405 that says what is allowed
const notAllowed = () => fail("method_not_allowed", 405, { Allow: "POST, OPTIONS" });
export const GET = notAllowed;
export const PUT = notAllowed;
export const PATCH = notAllowed;
export const DELETE = notAllowed;

export async function POST(request: Request) {
  try {
    // On Vercel the platform sets these from the connection (a client-sent value is overwritten), so
    // they are safe to key on there. Behind a proxy that merely appends, the left-most
    // x-forwarded-for entry is client-controlled: do not rely on this limiter off-platform.
    const h = request.headers;
    const ip = h.get("x-real-ip")?.trim() || h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (rateLimited(ip)) return fail("rate_limited", 429, { "Retry-After": "600" });

    // JSON only (a text/plain "simple" cross-site request must not be accepted), and a small body
    if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
      return fail("unsupported_media_type", 415);
    }
    if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
      return fail("payload_too_large", 413);
    }
    const raw = await readLimited(request);
    if (raw === null) return fail("payload_too_large", 413);

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return fail("invalid_json", 400);
    }

    const candidate =
      typeof body === "object" && body !== null && "email" in body
        ? (body as { email: unknown }).email
        : "";
    const email = typeof candidate === "string" ? candidate : "";

    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      return fail("invalid_email", 400);
    }

    const sql = neon(process.env.DATABASE_URL!);

    try {
      await sql`INSERT INTO waitlist (email) VALUES (${email})`;
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "23505"
      ) {
        return Response.json({
          success: true,
          message: "already_registered",
        });
      }
      throw err;
    }

    return Response.json({ success: true });
  } catch {
    return fail("server_error", 500);
  }
}
