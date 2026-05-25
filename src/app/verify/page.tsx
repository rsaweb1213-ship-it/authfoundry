"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const { addToast } = useToast();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      addToast("Please enter the complete verification code", "error");
      return;
    }

    if (!email) {
      addToast("Email is required. Please sign up again.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const result = await response.json();

      if (!response.ok) {
        addToast(result.error || "Verification failed", "error");
        return;
      }

      addToast("Email verified successfully! You can now log in.", "success");
      router.push("/login");
    } catch {
      addToast("An unexpected error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    setIsResending(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        addToast(result.error || "Failed to resend code", "error");
        return;
      }

      addToast("A new verification code has been sent.", "success");
    } catch {
      addToast("Failed to resend code. Please try again.", "error");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            {email ? (
              <>
                We sent a 6-digit code to{" "}
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {email}
                </span>
              </>
            ) : (
              "Enter the verification code sent to your email"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-center block">
                Verification Code
              </Label>
              <div className="flex justify-center gap-2">
                {code.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="h-12 w-12 text-center text-lg font-semibold"
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Verify Email
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50 dark:text-blue-400"
              >
                {isResending ? "Sending..." : "Resend code"}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
