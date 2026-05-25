import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ limit: 10, windowInSeconds: 60 });

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "anonymous";
    const rateResult = limiter.check(`verify:${ip}`);
    if (!rateResult.success) {
      return Response.json(
        { error: "Too many verification attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return Response.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      );
    }

    // Find and validate the verification token
    const token = await prisma.verificationToken.findFirst({
      where: {
        identifier: email.toLowerCase().trim(),
        token: code,
        expires: { gte: new Date() },
      },
    });

    if (!token) {
      return Response.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Update user as verified
    await prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: {
        isVerified: true,
        emailVerified: new Date(),
      },
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: token.identifier,
          token: token.token,
        },
      },
    });

    return Response.json({
      message: "Email verified successfully. You can now log in.",
      verified: true,
    });
  } catch (error) {
    console.error("[Verify] Error:", error);
    return Response.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
