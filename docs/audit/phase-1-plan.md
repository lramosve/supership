# SuperShip Rebuild Plan

## Phase 1: Audit and repository bootstrap
- inspect Fleetgraph code and docs
- identify non-negotiable concepts
- initialize local and GitHub repo
- commit audit artifacts

## Phase 2: Architecture and scaffolding
- create pnpm monorepo
- establish shared schemas and package boundaries
- configure lint, test, build, formatting, and env conventions
- document architecture decisions

## Phase 3: Core backend
- PostgreSQL schema
- unified documents service
- associations, history, comments, files, search, auth, visibility
- OpenAPI and tests

## Phase 4: Core frontend
- app shell, routing, auth
- unified document page and list views
- collaborative editor
- programs, projects, weeks, issues, dashboards, search

## Phase 5: FleetGraph parity and enhancements
- proactive findings engine
- on-demand chat
- stronger observability and traceability
- additional improvements that do not reduce parity

## Phase 6: Verification and release readiness
- parity matrix
- builds/tests/e2e checks
- seed/demo flow
- deployment documentation
