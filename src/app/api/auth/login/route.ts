import { signIn } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ limit: 10, windowInSeconds: 60 });

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "anonymous";
    const rateResult = limiter.check(`login:${ip}`);
    if (!rateResult.success) {
      return Response.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    try {
      await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      return Response.json({
        message: "Logged in successfully",
      });
    } catch (error: any) {
      // next-auth throws errors for failed auth
      const message =
        error?.message === "Account has been deactivated"
          ? "This account has been deactivated. Contact an administrator."
          : "Invalid email or password";

      return Response.json({ error: message }, { status: 401 });
    }
  } catch (error) {
    console.error("[Login] Error:", error);
    return Response.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}