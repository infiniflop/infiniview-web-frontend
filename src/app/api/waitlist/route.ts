import { neon } from "@neondatabase/serverless";

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
