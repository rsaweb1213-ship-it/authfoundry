"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

export function Header() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-sm font-bold text-white dark:bg-white dark:text-gray-900">
            AF
          </div>
          <span className="text-lg font-semibold dark:text-white">
            AuthFoundry
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden sm:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Home
          </Link>

          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Dashboard
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>

        {/* User menu */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm"
              >
                <Avatar
                  src={user.image}
                  alt={user.name || user.email || ""}
                  fallback={user.name || user.email || "U"}
                  size="sm"
                />
                <span className="hidden sm:inline text-sm font-medium dark:text-white">
                  {user.name || user.email}
                </span>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}