# ShiftUp Lab Connected Marketing Platform — Implementation Contract

## Scope (locked)
This release is a marketing and lead-capture platform, not the DINO consumer application.

Deployments:
- Main marketing website: `shiftuplab.com` (canonical host; `www.shiftuplab.com` may redirect to it)
- Blog: `blogs.shiftuplab.com`
- Careers: `careers.shiftuplab.com`
- Internal Admin: `admin.shiftuplab.com`
- Central API: `api.shiftuplab.com`

The website source supplied by the owner is the source of truth for the public website and DINO marketing pages. Preserve its design, content, existing waitlist fields, contact fields, validations, and approved interactions.

## User journeys
### Waitlist
Existing website waitlist form -> API `POST /v1/public/waitlist` -> PostgreSQL `app.waitlist_entries` -> Admin waitlist list/detail/update/export.

Preserve the existing website fields exactly: name, email, phone, state, city, institution/college, marketing consent, and source. Confirm exact live field names from the HTML and form JavaScript before changing the payload. Normalize email. Enforce unique email at database level. Duplicate submissions must return a safe, understandable response and must not create duplicate rows.

### Contact
Existing Contact Us form -> API `POST /v1/public/contacts` -> PostgreSQL `app.contacts` -> Admin contacts list/detail/update/export.

Preserve existing contact fields and topic choices. Do not invent new fields.

### Admin
Internal staff only. No public customer/student accounts. Admin login is required. Authentication and authorization must be enforced by the API. Admin features: overview counts, waitlist list/search/filter/detail/status/internal notes, contact list/search/filter/detail/status/internal notes, CSV export. No blog/Careers/user management features are required in this marketing-platform release unless explicitly added later.

### Blog and Careers
The main website Blog navigation must navigate to `https://blogs.shiftuplab.com`; Careers navigation must navigate to `https://careers.shiftuplab.com`. Blog and Careers are separate public deployments and read published content from the Central API. Their routes must not point to stale or misspelled hostnames.

## Backend and data
Central API is the sole system of record for waitlist and contact submissions. PostgreSQL schema is `app`. Development uses Neon branch `shiftuplab-platform`, database `shiftuplab`, runtime role `dino_api_dev`. Production uses a separately provisioned production branch and restricted runtime role. Never run migrations using the runtime role. Use a separately controlled migration credential.

Required records:
- Waitlist: id, name, email, phone, state, city, institution, marketing consent, source, status, internal notes, created/updated timestamps.
- Contact: id, name, email, topic/subject, message, status, internal notes, created/updated timestamps.
- Admin user: id, email, password hash, active/disabled status, timestamps.
- Audit event: actor, action, resource type/id, timestamp, safe metadata.

Use DB constraints for uniqueness and indexes for common admin filters. Avoid storing IP addresses or sensitive request data unless there is a documented need and retention policy.

## Security requirements
- Strong password hashing (Argon2id preferred; bcrypt with appropriately strong cost is acceptable).
- Short-lived access token or server-managed secure session; HttpOnly, Secure, SameSite cookies where cookie sessions are used.
- API-enforced admin authentication and permissions; no client-only protection.
- Login throttling, public form rate limiting, request size limits, DTO validation, strict CORS allowlist, security headers.
- Never log passwords, tokens, full database URLs, or unnecessary personal data.
- CSV formula-injection mitigation.
- Admin notes must never be exposed in public endpoints.
- Public endpoints return only safe response fields.
- Secrets only in local ignored `.env` and deployment secret settings; never in Git.
- Document privacy notice, consent semantics, data retention, deletion, backups, and incident response.

## Acceptance tests
1. Existing waitlist form submits successfully and creates one row.
2. Duplicate waitlist email does not create another row.
3. Existing Contact Us form submits successfully and creates one row.
4. Invalid input is rejected with safe errors.
5. Rate limits reject abusive submissions.
6. Admin can log in; invalid credentials fail; disabled admin cannot log in.
7. Unauthenticated admin API calls return 401.
8. Admin can search/filter/view/update status/add internal notes for waitlist and contacts.
9. CSV export includes only the selected dataset and neutralizes spreadsheet formulas.
10. Public API never exposes internal notes or admin data.
11. Blog and Careers public pages load published content and show safe empty states.
12. Website Blog/Careers links resolve to the exact requested subdomains.
13. All five projects install, lint/typecheck, build, and pass automated tests.
14. Development and production environment variables, databases, and secrets are separate.

## Release rule
A ZIP is not production-ready merely because it archives successfully. Mark a release production-ready only after successful clean dependency install, lint, typecheck, production build, automated tests, database migration validation, and cross-application integration tests. External-service checks must be explicitly labelled as not run if credentials/network access are unavailable.
