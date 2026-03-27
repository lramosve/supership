# SuperShip Architecture

## Why this architecture

SuperShip is a clean rebuild of Ship/Fleetgraph. The architecture intentionally preserves the original system's strongest ideas while removing avoidable historical complexity.

## Chosen structure

- `apps/api` for the HTTP API and future collaboration/FleetGraph services
- `apps/web` for the React UI
- `packages/shared` for shared types and schemas

## Justifications

### pnpm workspace monorepo
Fleetgraph already proved that a shared-type monorepo is the right fit for a document-centric product with a tightly coupled frontend and backend. Keeping one repo preserves shared language, shared schemas, and unified builds.

### Express API
The source system uses Express successfully. Reusing Express is justified because the rebuild goal is functional parity and maintainability, not framework churn.

### React + Vite frontend
Fleetgraph already validated React + Vite for complex editor-driven UI. This choice minimizes risk and preserves compatibility with the rich editor ecosystem.

### Shared schema package
The original system relied on shared types; SuperShip raises the bar by making explicit shared schemas a first-class package from day one. That improves parity safety between API and UI.

### Unified document model first
The shared package starts by encoding document types because the source documentation makes clear that the product is fundamentally built around one graph of documents. Starting elsewhere would risk drifting away from the product's core identity.

## Immediate roadmap enabled by this scaffold

1. Add persistent document schemas and document association models.
2. Introduce database-backed API modules by domain.
3. Build the unified document shell in the web app.
4. Layer in collaboration, search, comments, audit history, and FleetGraph parity.
