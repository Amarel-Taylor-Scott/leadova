# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Community health files: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`,
  `SECURITY.md`, issue/PR templates, and `CODEOWNERS`.

## [1.0.0] - 2026-06-21

### Added
- Full-stack lead-generation app: Express 5 + Knex/Postgres backend with JWT
  auth, Zod validation, Pino logging, and a chatbot service; SvelteKit frontend
  (country/vertical landing pages, agent intake, pricing, dashboard, auth).
- Docker Compose stack (Postgres + Redis + backend + frontend + Caddy).
- GitHub Actions CI (Node 22): `npm ci`, build (tsc + vite), typecheck, tests.
- Committed `package-lock.json` for reproducible installs.

### Fixed
- Backend TypeScript build: Pino logger argument order `(obj, msg)`;
  `jsonwebtoken` v9 `expiresIn` typing for an env-string value.
- Frontend build: replaced `bind:value` on a dynamic-`type` input with
  one-way `value` + `on:input` in the agent intake form.

[Unreleased]: https://github.com/Amarel-Taylor-Scott/leadova/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Amarel-Taylor-Scott/leadova/releases/tag/v1.0.0
