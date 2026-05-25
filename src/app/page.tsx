import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <section className="w-full py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Authentication for{" "}
              <span className="text-blue-600 dark:text-blue-400">Next.js</span>,
              Delivered.
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              A drop-in authentication boilerplate with email/password signup,
              OAuth, admin management dashboard, and security hardening — saving
              you weeks of setup and configuration.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full border-t border-gray-200 py-20 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Everything you need to ship auth fast
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Production-ready authentication infrastructure that just works.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border border-gray-200 p-6 dark:border-gray-700"
              >
                <div className="mb-4 text-3xl">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full border-t border-gray-200 py-20 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Ready to get started?
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Clone the repository, configure your environment variables, and
              deploy in minutes.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg">Create Account</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    title: "Email & Password Auth",
    description:
      "Complete email/password authentication with hashed passwords, rate limiting, and session management.",
    icon: "\u{1F510}",
  },
  {
    title: "OAuth Providers",
    description:
      "Google OAuth integration ready to go. Add more providers in minutes with NextAuth.js.",
    icon: "\u{1F511}",
  },
  {
    title: "Admin Dashboard",
    description:
      "Full admin panel with user management, pagination, search, impersonation, and role management.",
    icon: "\u2699\uFE0F",
  },
  {
    title: "Email Verification",
    description:
      "6-digit code verification emails sent via Resend. Verification status tracked per user.",
    icon: "\u{1F4E7}",
  },
  {
    title: "Password Reset",
    description:
      "Secure password reset flow with time-limited tokens and automatic session invalidation.",
    icon: "\u{1F504}",
  },
  {
    title: "Security Hardened",
    description:
      "Rate limiting, input validation, SQL injection protection, and middleware-based route protection.",
    icon: "\u{1F6E1}\uFE0F",
  },
];
