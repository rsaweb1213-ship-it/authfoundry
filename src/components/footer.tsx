export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} AuthFoundry. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Built with Next.js &middot; Open Source Auth Boilerplate
          </p>
        </div>
      </div>
    </footer>
  );
}