import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const limiter = rateLimit({ limit: 5, windowInSeconds: 60 });

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "anonymous";
    const rateResult = limiter.check(`signup:${ip}`);
    if (!rateResult.success) {
      return Response.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || !email.includes("@")) {
      return Response.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return Response.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user (unverified)
    const user = await prisma.user.create({
      data: {
        name: name || null,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: "user",
        isVerified: false,
        isActive: true,
      },
    });

    // Generate verification code (6-digit numeric)
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store verification token
    await prisma.verificationToken.create({
      data: {
        identifier: user.email!,
        token: verificationCode,
        expires: expiresAt,
      },
    });

    // Send verification email (best-effort, don't fail if email service isn't configured)
    try {
      const emailResult = await sendVerificationEmail(
        user.email!,
        verificationCode
      );
      if (!emailResult.success) {
        console.warn(
          "[Signup] Failed to send verification email:",
          emailResult.error
        );
      }
    } catch (err) {
      console.warn("[Signup] Email send error (non-blocking):", err);
    }

    return Response.json(
      {
        message:
          "Account created successfully. Please check your email for a verification code.",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Signup] Error:", error);
    return Response.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}