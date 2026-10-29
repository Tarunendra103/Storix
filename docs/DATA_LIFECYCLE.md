# Data lifecycle and privacy notes

Storix stores application profile data, password hashes, connected-account identifiers, encrypted Google OAuth tokens, and synchronized Google Drive metadata needed for the interface. It does not copy the full contents of Drive files into MySQL.

Google Drive remains authoritative. Disconnecting an account removes Storix-side account metadata and tokens but preserves the cloud files. File deletion is explicitly a provider operation and permanently affects the Google Drive file, subject to Google Drive behavior.

Operators should define retention, user-account deletion, backup retention, privacy policy, terms, Google OAuth verification, and incident-response processes before public launch. This document is technical guidance, not a legal compliance claim.
