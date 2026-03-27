# Fleetgraph Audit for SuperShip Rebuild

## Why this audit exists

SuperShip is a clean rebuild, not a partial refactor. To preserve functionality while improving architecture, the first phase establishes what the source system does, what concepts are fundamental, and what design choices should be carried forward.

## Source inspected

- Local repository: `..\\fleetgraph`
- Primary architecture and behavior docs reviewed:
  - `README.md`
  - `docs/unified-document-model.md`
  - `docs/document-model-conventions.md`
  - `docs/application-architecture.md`
  - `FLEETGRAPH.md`
  - `PRESEARCH.md`
- Additional repository inventory performed across API, web, shared, e2e, docs, and migrations.

## Core product capabilities identified

### Unified document system
The source app stores major content types in a common document model. The distinction between a wiki page, issue, project, week, or person page is expressed through document type, properties, and workflows rather than entirely separate storage models.

### Document types confirmed
- wiki
- issue
- program
- project
- sprint/week container
- weekly_plan
- weekly_retro
- person
- saved views/future extensibility patterns

### Major user-facing functionality confirmed
- rich document editing
- real-time collaborative editing with presence
- document trees and navigation
- issues with workflow state, assignees, estimates, and history
- programs and projects as first-class documents
- week workflows with plans, retros, standups, and issue assignment
- search and backlinks
- comments and audit history
- attachments/files
- visibility/privacy controls
- workspace auth and membership
- dashboard and team/resource views
- FleetGraph proactive findings and on-demand AI chat
- OpenAPI docs and extensive automated testing

## Architectural findings that SuperShip must preserve

### 1. Everything is a document
This is the most important concept in the codebase and documentation. It is explicitly described as the product philosophy and is reinforced by the data model, API, and UI.

### 2. Plans are the unit of intent
The weekly plan and retro workflow is not cosmetic. It is a core behavioral model around planning, execution, and reflection.

### 3. Same graph, different lenses
Docs/programs/weeks/resource views are different presentations over a shared document graph, not different systems.

### 4. Server is source of truth
The source app uses stale-while-revalidate caching and collaborative editing, but the system is not architected as an offline-first authority inversion.

### 5. Boring, proven technology is intentional
The source docs repeatedly justify using widely understood tools rather than novelty.

## Rebuild decisions justified by the audit

### Keep
- TypeScript across the stack
- monorepo structure
- React + Vite frontend
- Node/Express API
- PostgreSQL
- TipTap + Yjs collaboration model
- OpenAPI generation
- unified document model
- auditability and testing focus

### Improve
- start directly from the converged association model using `document_associations`
- define stricter shared schemas from day one
- make parity tracking explicit in documentation
- reduce migration-era historical complexity where possible while preserving behavior
- structure backend and frontend features by domain more clearly

## Initial SuperShip architecture choice

SuperShip will be built as a pnpm monorepo with:
- `apps/api`
- `apps/web`
- `packages/shared`
- `docs`

This keeps the original strengths while making the rebuild visibly distinct and easier to reason about.

## Parity requirement

SuperShip may add features, but no new feature is allowed to break or replace existing source functionality. Parity work is therefore a first-class deliverable, not an afterthought.
