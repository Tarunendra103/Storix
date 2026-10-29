# Storix backend

## Local startup (PowerShell)

1. Create a MySQL database named `storix` and an application database user.
2. Copy `.env.example` to a private environment file or set the listed variables in PowerShell. Never commit real values.
3. In the Google Cloud console, register `http://localhost:8080/api/accounts/google/callback` as an authorized redirect URI and enable the Google Drive API.
4. Run `./mvnw.cmd spring-boot:run`.

`JWT_SECRET` is required and must be Base64-encoded random data containing at least 32 bytes before encoding. It must remain stable across restarts or existing application JWTs and OAuth state values become invalid. `TOKEN_ENCRYPTION_KEY` is a separate Base64-encoded 32-byte AES key used for provider OAuth tokens stored in MySQL; it must also remain stable.

Set `CORS_ALLOWED_ORIGINS` to the comma-separated browser origins used in each environment. It defaults to the local `FRONTEND_URL`; do not use a wildcard in production.

Google Drive synchronization lists only non-trashed files owned by the authenticated connected account, follows every page token, and reconciles metadata only after the full listing succeeds. Shared-with-you and shared-drive items not owned by that account are intentionally excluded so they do not inflate personal categories or storage displays. Files remain in Google Drive; MySQL stores catalog metadata and connected-account details.

Existing unencrypted connected-account token rows remain readable for a safe rollout. Reconnect an account (or allow its next account update) to rewrite its stored tokens encrypted; keep the same `TOKEN_ENCRYPTION_KEY` thereafter.

## Verification

Run `./mvnw.cmd test`. The test suite uses an in-memory H2 database and does not require Google or MySQL credentials.
