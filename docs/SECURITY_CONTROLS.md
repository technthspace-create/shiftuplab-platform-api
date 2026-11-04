# Security gates

- The API currently exposes only a health endpoint; authentication, authorization, CRUD and uploads are not production-complete.
- Implement secure server-side sessions, password hashing, MFA policy, CSRF protections and RBAC before admin access.
- Configure PostgreSQL TLS with certificate verification; never use `rejectUnauthorized: false`.
- Add distributed rate limiting and idempotency/unique constraints for concurrent waitlist submissions.
- Add request size limits, DTO validation, audit events, secret rotation and dependency scanning.
- Add private object storage with malware scanning and signed, short-lived access for CVs.
- Define retention, deletion, consent withdrawal and incident response procedures.
