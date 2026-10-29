# Deployment guide

## Recommended topology

Use a static HTTPS frontend (or the supplied Nginx container), one Java 21 backend service, and a managed MySQL 8 instance reachable only from the backend private network. Terminate TLS at the edge. Route `/api/*` to the backend and all other paths to the Vite client.

Configure secrets in the platform secret store, not in files or images:

- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
- `JWT_SECRET` — Base64 encoding of at least 32 random bytes.
- `TOKEN_ENCRYPTION_KEY` — Base64 encoding of exactly 32 random bytes.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`

For a public domain `https://app.example.com`, set `GOOGLE_REDIRECT_URI=https://app.example.com/api/accounts/google/callback`, `FRONTEND_URL=https://app.example.com`, and `CORS_ALLOWED_ORIGINS=https://app.example.com`. Register the same callback in Google Cloud Console. Do not use wildcard CORS origins.

## Release procedure

1. Run the backend tests and frontend lint/build locally and in CI.
2. Take and verify a database backup before changing application versions or schema settings.
3. Deploy the new backend, wait for `/actuator/health` to report `UP`, then deploy the frontend.
4. Smoke-test login, account connection, one sync, preview, download, and a non-destructive navigation flow using a test Google account.
5. Monitor error logs and sync failures before widening user access.

## Rollback

Keep the previous backend image and frontend artifact. If the new release fails health checks or core smoke tests, route traffic back to the previous version, then restore a database backup only when a schema/data incident requires it. Never rotate `JWT_SECRET` or `TOKEN_ENCRYPTION_KEY` during an ordinary rollback; doing so invalidates sessions or makes stored OAuth tokens unreadable.

## Database evolution

The existing database is managed by Hibernate update for development compatibility. It is not safe to treat automatic updates as an audited production migration process. Before the first production launch, baseline the actual schema in a migration tool such as Flyway in a staging copy, compare it with the JPA entities, test both upgrade and rollback, and only then set production schema validation. Do not use `ddl-auto=create`, drop tables, or reset the database.
