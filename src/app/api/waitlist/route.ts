import { neon } from "@neondatabase/serverless";

// Neon HTTP driver works on the default Node.js (Fluid Compute) runtime.
// Prefer co-locating the Vercel project/function region with the Neon DB (e.g. iad1).

const MAX_BODY_BYTES = 2048;

// Best-effort abuse brake. State lives per warm function instance, so this blunts a single client
// hammering the endpoint but is NOT a durable limit: sustained abuse needs edge rate limiting
// (e.g. a Vercel WAF rate-limit rule on POST /api/waitlist) and/or a bot challenge.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 8;
const hits = new Map<string, number[]>();

function rateLimited(ip: string, now = Date.now()): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    // keep memory bounded: drop clients whose last hit is outside the window
    for (const [key, times] of hits) {
      if (now - times[times.length - 1] >= WINDOW_MS) hits.delete(key);
    }
  }
  return recent.length > MAX_HITS;
}

const fail = (error: string, status: number, headers?: HeadersInit) =>
  Response.json({ success: false, error }, { status, headers });

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (rateLimited(ip)) return fail("rate_limited", 429, { "Retry-After": "600" });

    // JSON only (a text/plain "simple" cross-site request must not be accepted), and a small body
    if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
      return fail("unsupported_media_type", 415);
    }
    if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
      return fail("payload_too_large", 413);
    }
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return fail("payload_too_large", 413);

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email.length > 254 || !emailRegex.test(email)) {
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
