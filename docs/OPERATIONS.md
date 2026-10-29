# Operations runbook

## Health and logs

Use `GET /actuator/health` for liveness/readiness checks. It intentionally returns no component details. Search backend logs by user/account identifiers only when necessary; tokens, passwords, and file content must never be logged.

## Failed synchronization

1. Confirm the connected account still exists and its OAuth authorization has not been revoked.
2. Ask the user to reconnect if Google rejected token refresh or revoked consent.
3. Retry **Rescan**. A failed listing does not reconcile or delete existing metadata.
4. Check the Google Drive API quota and backend logs for upstream failures.

## Storage mismatch

Provider quota and the sum of visible file sizes are distinct measurements. Storix presents provider quota separately from catalog category totals. After upgrading from a version that included shared/unowned records, restart the backend and run **Rescan All**. The current owned-file query safely removes stale local metadata only after the complete Drive listing succeeds.

## Backup and recovery

Back up MySQL with point-in-time recovery or scheduled logical backups, encrypt backup storage, test restores regularly, and restrict backup access. To recover: stop writes, restore into an isolated MySQL instance, validate users/accounts/file metadata counts, then point the backend to the restored database. Cloud files remain in Google Drive and are not stored in MySQL.

## Account disconnection

Disconnecting removes the Storix connection metadata and stored OAuth credentials. It does not delete any Google Drive file. Deleting files from Storix is different: the selected file is deleted from Google Drive after confirmation.
