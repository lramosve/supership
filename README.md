# SuperShip

SuperShip is a from-scratch rebuild of Ship/Fleetgraph that preserves the original product's core behavior while improving internal architecture, maintainability, and auditability.

## Mission

Rebuild the Fleetgraph local codebase as a fresh application named **SuperShip** without sacrificing existing functionality.

## Core Non-Negotiable

**Everything is a document.**

SuperShip preserves the unified document model:
- wiki pages are documents
- issues are documents
- programs are documents
- projects are documents
- week containers are documents
- weekly plans and retros are documents
- person profiles are documents

This is the central architectural concept inherited from Ship and must remain true throughout the rebuild.

## Current phase status

- Phase 1: audit and bootstrap complete
- Phase 2: architecture and scaffolding complete
- Phase 3: core backend complete
- Phase 4: core frontend complete
- Phase 5: parity findings, traceability, and chat complete
- Phase 6: verification and release readiness complete

## Workspace commands

- `pnpm test`
- `pnpm build`
- `pnpm verify:release`
- `pnpm dev`
- `pnpm dev:api`
- `pnpm dev:web`

## Demo flow

- start the API and web app
- explore the dashboard and documents shell
- create or edit a document
- open the parity console for findings, traceability, and chat
- run release verification to prove the live API path

## Release-readiness docs

- `docs/parity-matrix.md`
- `docs/release-readiness.md`
- `docs/architecture.md`
- `docs/audit/phase-1-plan.md`
