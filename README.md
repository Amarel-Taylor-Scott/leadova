# Leadova

Leadova is a private full-stack lead-generation and outreach product. The repo
contains a TypeScript/Express backend, a SvelteKit frontend, database
migrations, Dockerfiles, Compose config, Caddy config, and a Makefile.

## Current Shape

```text
leadova/
├── backend/        Express API, migrations, v1 routes, chatbot service
├── frontend/       SvelteKit app with country, vertical, pricing, dashboard,
│                   admin, agent, blog, contact, and auth routes
├── docker-compose.yml
├── Caddyfile
├── Makefile
└── package.json
```

## Scripts

The root package uses workspaces and requires Node 22 or newer.

```bash
npm run build
npm run lint
npm test
```

Development is Docker-first:

```bash
npm run dev
npm run dev:down
npm run dev:logs
```

## Verification Snapshot

Last static inventory pass: 2026-05-24.

- Package manifests were parsed.
- Source shape was inspected: 58 files under `backend/src` and `frontend/src`.
- Runtime commands were not run because this app uses Docker, databases, and
  external service integrations.

## Operational Boundaries

During broad ecosystem cleanup, prefer static checks and manifest parsing. Do
not run Docker, migrations, seeders, lead import, checkout, outreach, or
deployment commands unless the session is explicitly scoped for application
verification.

## Related Repos

- `agency_email_scraper` is adjacent lead-source infrastructure.
- `sponsoragent` is an adjacent outreach automation product.
- `adstack` is an adjacent advertising/product infrastructure repo.
