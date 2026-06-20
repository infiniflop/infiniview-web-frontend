import { neon } from "@neondatabase/serverless";

// Run on the Edge runtime (near-zero cold start) instead of the Node serverless
// runtime, and pin to iad1 to stay co-located with the us-east-1 Neon database.
// The neon() HTTP driver is built for this, so the insert is a single fast round trip.
export const runtime = "edge";
export const preferredRegion = "iad1";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email: string = body.email ?? "";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email.length > 254 || !emailRegex.test(email)) {
      return Response.json(
        { success: false, error: "invalid_email" },
        { status: 400 },
      );
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
    return Response.json(
      { success: false, error: "server_error" },
      { status: 500 },
    );
  }
}
