import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

const limiter = rateLimit({ limit: 3, windowInSeconds: 60 });

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "anonymous";
    const rateResult = limiter.check(`forgot-password:${ip}`);
    if (!rateResult.success) {
      return Response.json(
        {
          error: "Too many requests. Please try again later.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return Response.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists (don't reveal this info to the client)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return Response.json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store the reset token
    await prisma.passwordResetToken.create({
      data: {
        email: normalizedEmail,
        token: resetToken,
        expiresAt,
      },
    });

    // Build reset URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;

    // Send password reset email (best-effort)
    try {
      const emailResult = await sendPasswordResetEmail(
        normalizedEmail,
        resetUrl
      );
      if (!emailResult.success) {
        console.warn(
          "[ForgotPassword] Failed to send email:",
          emailResult.error
        );
      }
    } catch (err) {
      console.warn("[ForgotPassword] Email send error (non-blocking):", err);
    }

    return Response.json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("[ForgotPassword] Error:", error);
    return Response.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}