# SuperShip Deployment

## Targets

- web: Vercel
- api: Railway

## Web deployment

The web app is deployed from `apps/web` using Vite output in `dist`.

Deployment settings encoded in `apps/web/vercel.json`:

- install command: `pnpm install --frozen-lockfile`
- build command: `pnpm build`
- output directory: `dist`

## API deployment

The API is deployed from the monorepo with Railway using `apps/api/nixpacks.toml`.

Build and runtime behavior:

- setup Node.js 20 and pnpm
- install workspace dependencies with pnpm
- build shared package and api package
- start the API with `pnpm --filter @supership/api start`

## Post-deploy verification

- web root loads and renders the parity workspace shell
- api `/api/health` returns `ok`
- api `/api/documents` returns seeded documents
- api `/api/documents/doc-program-alpha/findings` returns parity findings
