# Release checklist

## Production cutover (Render API + Vercel frontends + Neon)

Do not commit `.env`, passwords, or Neon URLs.

### 1. GitHub remotes (pushed)

- Website (org, live Vercel source): https://github.com/askshiftup-lab/Shiftuplab_Waitlist_Website
- API: https://github.com/technthspace-create/shiftuplab-platform-api
- Blog: https://github.com/technthspace-create/shiftuplab-blog
- Careers: https://github.com/technthspace-create/shiftuplab-careers
- Admin: https://github.com/technthspace-create/shiftuplab-admin

`askshiftup-lab/shiftuplab-admin` and `askshiftup-lab/shiftuplab-careers` exist but this account only has read access, so production source was pushed to `technthspace-create/*`. Transfer those four repos into `askshiftup-lab` (or grant push) before connecting Render/Vercel if the org must own them. Do not copy `.env`.

### 2. Neon production

- Use the **owner/migration** role, not `dino_api_dev`.
- Connection string must include `?sslmode=require&schema=app`.
- First API boot runs `prisma migrate deploy` and creates the `app` schema.
- Keep the Neon development branch off these production env vars.

### 3. Render — `api.shiftuplab.com`

1. New **Web Service** from the API GitHub repo, **Docker** runtime, **Starter** plan (not free — free instances sleep).
2. Health check path: `/v1/health`.
3. Set env:

```
DATABASE_URL=<neon production URL with schema=app>
JWT_SECRET=<32+ random characters>
JWT_EXPIRES_IN=8h
ADMIN_EMAIL=<staff email>
ADMIN_PASSWORD=<12+ character password>
CORS_ORIGINS=https://shiftuplab.com,https://www.shiftuplab.com,https://blogs.shiftuplab.com,https://careers.shiftuplab.com,https://admin.shiftuplab.com
NODE_ENV=production
PORT=4000
```

4. Add custom domain `api.shiftuplab.com` and create the CNAME Render shows.

### 4. Vercel — four projects

Create one project per repo. Production env:

- website: `PLATFORM_API_URL=https://api.shiftuplab.com`
- blog: `PLATFORM_API_URL=https://api.shiftuplab.com` and `NEXT_PUBLIC_SITE_URL=https://blogs.shiftuplab.com`
- careers: `PLATFORM_API_URL=https://api.shiftuplab.com` and `NEXT_PUBLIC_SITE_URL=https://careers.shiftuplab.com`
- admin: `NEXT_PUBLIC_PLATFORM_API_URL=https://api.shiftuplab.com`

Attach domains: `shiftuplab.com` / `www.shiftuplab.com`, `blogs.shiftuplab.com`, `careers.shiftuplab.com`, `admin.shiftuplab.com`.

Set website `PLATFORM_API_URL` only after `https://api.shiftuplab.com/v1/health` returns ok.

### 5. DNS

- Apex / `www` → Vercel (website)
- `blogs` / `careers` / `admin` → Vercel CNAMEs
- `api` → Render CNAME

### 6. Smoke

1. `GET https://api.shiftuplab.com/v1/health` → `{ "status": "ok" }`
2. Website waitlist + contact → row in Admin
3. `https://admin.shiftuplab.com/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`
4. Blog and Careers load (empty state is OK until published rows exist)
5. Duplicate waitlist email returns a safe 409
6. Unauthenticated `GET /v1/admin/waitlist` returns 401

## Local / remaining checks

- [ ] Install dependencies and generate Prisma client
- [ ] Validate Prisma schema and apply migration on a disposable local DB
- [ ] Apply migration on Neon using owner/migration role
- [ ] Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` on the API host; never put them in Git
- [ ] Verify login rejects invalid credentials and admin endpoints reject missing/invalid JWTs
- [ ] Verify public waitlist duplicate handling, contact validation, rate limits and honeypot
- [ ] Verify admin search, statuses, notes, CSV escaping/formula neutralization
- [ ] Verify no internal notes appear in public Blog/Careers/form responses
- [ ] Reconcile historical Google Sheets data after live forms are on the API
- [ ] Verify CORS, HTTPS, and secrets are host env only

Known remaining hardening: admin browser token is in `sessionStorage` rather than an HttpOnly BFF session; API throttling is in-process.
