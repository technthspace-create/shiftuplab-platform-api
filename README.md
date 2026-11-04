# ShiftUp Lab Central Platform API

NestJS API shared by the marketing website, Blog, Careers and Admin. Public routes: `POST /v1/waitlist`, `POST /v1/contact`, `GET /v1/blog`, `GET /v1/blog/:slug`, `GET /v1/careers/jobs`. Admin routes require `Authorization: Bearer <accessToken>` from `POST /v1/auth/login`: overview, waitlist/contact search, status/notes updates and CSV export.

## Local run
1. Install Node.js 20+ and PostgreSQL 15+ (or use your Neon **development** branch).
2. `cp .env.example .env` and set `DATABASE_URL` and a random `JWT_SECRET` (32+ characters).
3. `npm install && npm run prisma:generate`.
4. Run migrations with a database owner/migration role that can create objects in schema `app`: `npm run prisma:migrate:deploy`. Do not use the restricted `dino_api_dev` role for migrations unless it has the required privileges.
5. Start API: `npm run start:dev`.
6. Provision the first admin from a trusted terminal: `npm run admin:create -- admin@example.com 'Admin' 'use-a-long-unique-password'`. Do not expose this command as a public endpoint.

`DATABASE_URL` should point to the Neon development branch with `sslmode=require&schema=app`. Never commit `.env`. Use the pooled runtime connection for the API; use a direct migration connection for Prisma migrations where required by Neon.

## Important
- This API is designed to store website waitlist/contact records in Neon. Website Google Sheets integration remains as fallback when `PLATFORM_API_URL` is not configured; cut over only after historical Sheet rows are reconciled/imported.
- Blog and Careers public content is read-only in this release; publishing content requires controlled database inserts or a future editorial interface.
- Access tokens are short-lived bearer tokens. Admin UI stores the token in sessionStorage; deploy only behind HTTPS and apply a strict CSP. For higher assurance, replace with an HttpOnly same-site session/BFF before broad production use.
- Rate limiting currently uses Nest throttling in process memory; horizontally scaled production needs shared/distributed throttling.
- Run `npm test`, `npm run build`, and smoke tests before production.
