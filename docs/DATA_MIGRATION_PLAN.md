# Historical data migration

1. Securely export and inventory the current Google Sheets records.
2. Map source columns to WaitlistEntry and Contact, preserving consent timestamps/semantics where available.
3. Profile nulls, duplicates, normalization and conflicting records.
4. Run a dry-run import into an isolated PostgreSQL database.
5. Reconcile counts and deterministic record samples; document exceptions.
6. Test application reads/writes and rollback.
7. Obtain separate written production-cutover approval.
8. Keep source-of-truth writes on the current verified path until cutover is approved.

Do not infer consent or silently discard duplicates. Backups must be encrypted and access restricted.
