# Storix frontend

The Vite client talks only to the Storix API; it has no mock-data fallback and never receives Google OAuth credentials.

## Local startup (PowerShell)

1. Copy `.env.example` to `.env` if the API is not at `http://localhost:8080/api`.
2. Run `npm install`.
3. Run `npm run dev`.

Use `npm run lint` and `npm run build` before shipping.

Google Drive files are fetched through authenticated backend endpoints for previews and downloads. Images, PDFs, and videos display real file bytes; unsupported formats show metadata and a real download action.
