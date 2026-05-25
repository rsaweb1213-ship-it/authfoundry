import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

const limiter = rateLimit({ limit: 5, windowInSeconds: 60 });

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "anonymous";
    const rateResult = limiter.check(`reset-password:${ip}`);
    if (!rateResult.success) {
      return Response.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { token, email, password } = body;

    if (!token || !email || !password) {
      return Response.json(
        { error: "Token, email, and new password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find valid reset token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        email: normalizedEmail,
        token,
        expiresAt: { gte: new Date() },
      },
    });

    if (!resetToken) {
      return Response.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user password
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { passwordHash },
    });

    // Delete the used reset token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    // Delete all sessions for this user to force re-login
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (user) {
      await prisma.session.deleteMany({
        where: { userId: user.id },
      });
    }

    return Response.json({
      message:
        "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("[ResetPassword] Error:", error);
    return Response.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}