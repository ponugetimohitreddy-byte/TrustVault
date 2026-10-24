# VaultLedger — Secure Document Management System

MERN application for uploading, publishing, and sharing documents with **document-specific** permissions. Account roles are only `admin` and `employee`. Publisher, editor, and viewer are not account types; they are assigned per document.

## Features

- JWT access tokens (15 minutes) plus rotating refresh tokens in HttpOnly cookies
- bcrypt password hashing (cost factor 12)
- Document visibility: private, restricted, organization-wide
- Separate `DocumentPermission` collection with a unique `(documentId, userId)` index
- Version history on file replacement
- Immutable audit logs (no update/delete APIs)
- Private file storage in MongoDB GridFS (same database as document metadata)
- Helmet, CORS, CSRF (cookie clients), rate limiting, Zod validation

## Project layout

```text
mohit_doc_viewer/
├── client/          React + Vite + Tailwind
├── server/          Express + Mongoose
├── tests/           (inside server/tests)
├── .env.example
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB locally, or a MongoDB Atlas connection string

## Setup

```bash
cd mohit_doc_viewer
copy .env.example .env
npm install
npm run install:all
npm run seed
npm run dev
```

- API: http://localhost:5000
- App: http://localhost:5173

Seeded accounts (change after first login in production):

| Role      | Email                 | Password         | Department |
|-----------|-----------------------|------------------|------------|
| Admin     | admin@company.com     | Admin123!@#      | IT |
| Admin     | mohit@company.com     | 123456789        | IT |
| Employee  | employee@company.com  | Employee123!@#   | Operations |
| Employee  | jordan@company.com    | Employee123!@#   | Finance |
| Employee  | priya@company.com     | Employee123!@#   | Human Resources |
| Employee  | sam@company.com       | Employee123!@#   | Legal |
| Employee  | riley@company.com     | Employee123!@#   | Engineering |
| Employee  | morgan@company.com    | Employee123!@#   | Marketing |
| Employee  | casey@company.com     | Employee123!@#   | Operations |

## Environment variables

See `.env.example`. Never commit `.env`.

### File storage

Uploaded files are stored in MongoDB GridFS (`documentFiles.files` / `documentFiles.chunks`) on the same `MONGODB_URI`. Document metadata still keeps a `storageKey` used to look up the GridFS object. Downloads and previews are streamed after authorization. Files are not written to local disk or Amazon S3.

## Authorization policy

A valid JWT proves identity. It does **not** grant document access.

| Action | Who |
| --- | --- |
| View | Admin, publisher, explicit viewer/editor, or any active employee if visibility is `organization` |
| Download | Same as view for admin/publisher; others only if `allowDownload` is true |
| Edit / replace file | Admin, publisher, or explicit editor |
| Manage permissions | Admin or publisher |
| Organization-wide visibility | Admin only |
| Delete (soft) | Admin or publisher |
| User administration | Admin only |

Private documents are visible only to the publisher and administrators. Restricted documents require an explicit permission record.

Deactivating a user increments `tokenVersion` and revokes refresh tokens, so existing sessions fail on the next request. Owned documents remain; an administrator can reassign `publisherId` via `PATCH /api/documents/:id`.

## API reference

All authenticated routes accept `Authorization: Bearer <accessToken>` (used by tests and the SPA) or the `access_token` cookie. Mutating cookie-authenticated requests also require `X-CSRF-Token`.

### Auth

- `POST /api/auth/login` `{ email, password }`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

### Users (admin except search)

- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `PATCH /api/users/:id/status` `{ isActive }`
- `GET /api/users/search?q=`

### Documents

- `POST /api/documents` multipart: `file`, `title`, `description?`, `visibility?`, `allowDownload?`, `publisherId?`
- `GET /api/documents` query: `q`, `scope=published|shared`, `visibility`, `page`, `limit`
- `GET /api/documents/:id`
- `GET /api/documents/:id/download?version=`
- `GET /api/documents/:id/preview`
- `GET /api/documents/:id/versions`
- `PATCH /api/documents/:id` metadata and optional replacement file
- `DELETE /api/documents/:id`
- `PATCH /api/documents/:id/visibility` `{ visibility }`

### Permissions

- `GET /api/documents/:id/permissions`
- `PUT /api/documents/:id/permissions/:userId` `{ permission: editor|viewer }`
- `DELETE /api/documents/:id/permissions/:userId`

### Audit and stats

- `GET /api/audit-logs` (admin)
- `GET /api/documents/:id/audit-logs`
- `GET /api/stats/dashboard` (admin)

Unauthorized document lookups return **404** (not 403) to avoid leaking existence.

## Tests

```bash
npm test
```

Integration tests cover authentication, IDOR, viewer/editor/publisher rules, revocation, deactivation, JWT rejection, version-history isolation, and audit logging.

## Production notes

- Set strong unique `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
- Set `COOKIE_SECURE=true` and `COOKIE_SAMESITE=strict` or `lax` behind HTTPS
- Point `CLIENT_ORIGIN` at the real frontend origin
- Use Atlas + private S3 with no public ACLs
- Do not expose public unauthenticated document links
# Vault_document
