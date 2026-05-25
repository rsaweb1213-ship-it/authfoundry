# Rebranding Guide

This guide explains how to customize AuthFoundry for your own project.

## 1. App Name

To rename the application, search and replace "AuthFoundry" in the following locations:

- **`.env` and `.env.example`**: Update `NEXT_PUBLIC_APP_NAME="YourAppName"`.
- **`src/app/layout.tsx`**: Update the `metadata.title` property.
- **`src/components/header.tsx`**: Update the brand name in the navigation bar.
- **`src/components/footer.tsx`**: Update the copyright notice.
- **`src/lib/email.ts`**: Update the fallback app name in email subjects/bodies (though it primarily uses the env var).
- **`package.json`**: Update the `name` field.
- **Documentation**: Update `README.md`, `API_REFERENCE.md`, and `REBRANDING.md`.

## 2. Colors and Theme

AuthFoundry uses Tailwind CSS with CSS variables for easy theming.

- **`src/app/globals.css`**: Update the `--background` and `--foreground` CSS variables in the `:root` (light mode) and `@media (prefers-color-scheme: dark)` (dark mode) sections.
- **`tailwind.config.ts`**: Add or modify the color palette in the `theme.extend.colors` section. You can define new variables here and reference them in your components.

## 3. Logo and Favicon

- **Favicon**: Replace `src/app/favicon.ico` with your own icon file.
- **Logo**: Add your logo asset (SVG or PNG) to the `public/` directory and update the logo reference in `src/components/header.tsx`.

## 4. Email Configuration

- **Sender Address**: Update `RESEND_FROM_EMAIL` in your `.env` file to your verified domain's sender address.
- **Templates**: Customize the HTML/text templates for verification and password reset emails in `src/lib/email.ts`.

## 5. Deployment and Callbacks

- **App URL**: In production, set `NEXT_PUBLIC_APP_URL` and `AUTH_URL` in your environment variables to your actual domain (e.g., `https://myapp.com`).
- **OAuth Callbacks**: Update your Google OAuth redirect URIs in the Google Cloud Console to: `https://yourdomain.com/api/auth/callback/google`.
