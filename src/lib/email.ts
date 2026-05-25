import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@authfoundry.dev";

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    if (!resendApiKey) {
      throw new Error(
        "RESEND_API_KEY is not configured. Set it in your .env file."
      );
    }
    resendClient = new Resend(resendApiKey);
  }
  return resendClient;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send a transactional email using Resend.
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    const { data: _data, error } = await resend.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error("[Email] Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("[Email] Failed to send email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}

/**
 * Send a verification code email.
 */
export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "AuthFoundry";

  return sendEmail({
    to: email,
    subject: `Verify your ${appName} account`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
        <h1 style="font-size: 24px; margin-bottom: 16px; color: #111;">Verify your email address</h1>
        <p style="font-size: 16px; line-height: 1.5; color: #444; margin-bottom: 24px;">
          Thanks for signing up for ${appName}! Use the verification code below to complete your registration.
        </p>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #111;">${code}</span>
        </div>
        <p style="font-size: 14px; line-height: 1.5; color: #888;">
          This code expires in 15 minutes. If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `Your verification code is: ${code}\n\nThis code expires in 15 minutes.`,
  });
}

/**
 * Send a password reset email.
 */
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<{ success: boolean; error?: string }> {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "AuthFoundry";

  return sendEmail({
    to: email,
    subject: `Reset your ${appName} password`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
        <h1 style="font-size: 24px; margin-bottom: 16px; color: #111;">Reset your password</h1>
        <p style="font-size: 16px; line-height: 1.5; color: #444; margin-bottom: 24px;">
          You requested a password reset for your ${appName} account. Click the button below to set a new password.
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${resetUrl}" style="display: inline-block; background: #111; color: white; font-size: 16px; font-weight: 600; padding: 12px 32px; border-radius: 6px; text-decoration: none;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 14px; line-height: 1.5; color: #888;">
          If the button doesn't work, copy and paste this URL into your browser:<br/>
          <span style="color: #666;">${resetUrl}</span>
        </p>
        <p style="font-size: 14px; line-height: 1.5; color: #888;">
          This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `Reset your password by visiting: ${resetUrl}\n\nThis link expires in 1 hour.`,
  });
}
