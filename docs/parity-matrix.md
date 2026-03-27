# SuperShip Parity Matrix

## Goal

This matrix tracks which Fleetgraph/Ship product ideas are now present in SuperShip and which areas still need deeper implementation before a production release.

## Status legend

- **done**: implemented and covered by tests/build verification
- **partial**: scaffolded with representative behavior but not yet production-complete
- **planned**: intentionally deferred beyond the current rebuild state

## Product parity matrix

| Capability | Status | Notes |
| --- | --- | --- |
| Unified document model | done | Every major object category is modeled as a document in shared schemas, API contracts, and web flows. |
| Document list/detail experience | done | Web explorer supports list, detail, type filtering, and search. |
| Document create/update | done | API and frontend editor flows both support creation and updates with fallback behavior. |
| Program/project/week visibility | done | Seeded documents and dashboard views surface cross-document portfolio state. |
| Proactive findings | partial | Findings are implemented as deterministic seeded parity signals with API and UI support. |
| Traceability / audit timeline | partial | Trace events are modeled and surfaced, but do not yet reflect every mutation automatically. |
| On-demand chat | partial | Chat exchanges are available per document with deterministic assistant responses. |
| Collaboration | planned | Multi-user live editing and presence are not yet implemented. |
| Associations / graph traversal | planned | Rich links among documents are still future work. |
| Comments / files / search index | planned | Not yet implemented beyond document text filtering in the frontend. |
| Auth / visibility rules | planned | No authentication or fine-grained access controls yet. |
| Persistence | partial | The current platform uses in-memory repositories and seeded data, not a production database. |
| OpenAPI / external contract publishing | planned | API routes are stable enough to document next, but no generated OpenAPI artifact exists yet. |

## Verification evidence

The following checks currently back the completed and partial items above:

- shared schema tests
- API route tests
- web shell tests
- production builds for shared, api, and web
- release verification script hitting a live API instance

## Release interpretation

SuperShip is now a strong parity-oriented prototype and engineering foundation. It is release-ready for internal demos, validation, and further implementation phases, but not yet a production-hard deployment target because persistence, auth, and full graph behavior remain incomplete.
