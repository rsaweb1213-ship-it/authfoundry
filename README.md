# AuthFoundry

AuthFoundry is a production-ready authentication boilerplate for Next.js 14 applications. It provides a comprehensive set of features including email/password signup, OAuth integration, a full admin management dashboard, and robust security hardening.

## Features

- \u{1F510} **Email & Password Authentication**: Secure signup and login flows with hashed passwords and session management.
- \u{1F511} **OAuth Integration**: Built-in support for Google OAuth, easily extensible to other providers via NextAuth.js.
- \u2699\uFE0F **Admin Management Dashboard**: Manage users, search, paginate, edit roles, verify accounts, and impersonate users.
- \u{1F4E7} **Email Verification**: Transactional emails for account verification using Resend.
- \u{1F504} **Password Reset**: Secure, time-limited password reset flow.
- \u{1F6E1}\uFE0F **Security Hardened**: Rate limiting, input validation (Zod), SQL injection protection (Prisma), and secure middleware-based route protection.
- \u{1F3A8} **Modern UI**: Built with Next.js 14 App Router, Tailwind CSS, and custom UI components.

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)
![NextAuth.js](https://img.shields.io/badge/NextAuth.js-v5-000000?style=flat-square&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![Resend](https://img.shields.io/badge/Resend-Email-black?style=flat-square)

## Prerequisites

Before you begin, ensure you have the following:

- **Node.js**: version 18 or higher.
- **PostgreSQL**: A running database instance.
- **Resend API Key**: For sending transactional emails.
- **Google OAuth Credentials**: For Google sign-in integration.

## Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/authfoundry.git
   cd authfoundry
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Copy `.env.example` to `.env` and fill in your credentials.
   ```bash
   cp .env.example .env
   ```

4. **Generate Prisma client**:
   ```bash
   npx prisma generate
   ```

5. **Initialize the database**:
   ```bash
   npx prisma db push
   ```

6. **Run the development server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `NEXTAUTH_SECRET` | Secret used to sign NextAuth tokens | - |
| `NEXTAUTH_URL` | The base URL of your application | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | - |
| `RESEND_API_KEY` | Your Resend API Key | - |
| `RESEND_FROM_EMAIL` | The email address to send from | `noreply@authfoundry.dev` |
| `NEXT_PUBLIC_APP_NAME` | The name of your application | `AuthFoundry` |
| `NEXT_PUBLIC_APP_URL` | The public URL of your application | `http://localhost:3000` |

## Folder Structure

```text
authfoundry/
\u251C\u2500\u2500 prisma/               # Database schema and config
\u251C\u2500\u2500 public/               # Static assets
\u251C\u2500\u2500 src/
\u2502   \u251C\u2500\u2500 app/             # Next.js App Router pages and API routes
\u2502   \u2502   \u251C\u2500\u2500 admin/         # Admin dashboard pages
\u2502   \u2502   \u251C\u2500\u2500 api/           # API endpoints (auth, user, admin)
\u2502   \u2502   \u251C\u2500\u2500 dashboard/     # User profile/dashboard
\u2502   \u2502   \u2514\u2500\u2500 (auth)/        # Auth pages (login, signup, etc.)
\u2502   \u251C\u2500\u2500 components/      # Shared React components
\u2502   \u2502   \u2514\u2500\u2500 ui/            # Base UI components (buttons, cards, etc.)
\u2502   \u251C\u2500\u2500 lib/             # Utilities and shared logic
\u2502   \u2514\u2500\u2500 middleware.ts    # Route protection and security headers
\u251C\u2500\u2500 .env                 # Environment variables
\u251C\u2500\u2500 next.config.mjs      # Next.js configuration
\u251C\u2500\u2500 package.json         # Project dependencies and scripts
\u2514\u2500\u2500 tailwind.config.ts   # Tailwind CSS configuration
```

## Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint for code quality checks.

## Deployment (Vercel)

1. Push your code to a GitHub repository.
2. Connect your repository to Vercel.
3. Add all environment variables from your `.env` file to the Vercel project settings.
4. Vercel will automatically detect Next.js and deploy your application.

## Rebranding

See [REBRANDING.md](./REBRANDING.md) for a guide on how to customize AuthFoundry for your brand.

## API Reference

See [API_REFERENCE.md](./API_REFERENCE.md) for a complete list of available API endpoints.
