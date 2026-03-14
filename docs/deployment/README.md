# Deployment (reference only)

**Reference documentation** — where we're deployed, what runs where, which services and accounts we use, and how to keep envs in sync.

- **Where we've deployed** — which envs exist, what's running (e.g. app URLs, regions)
- **Branch → env mapping** — which branch deploys to dev, staging, prod
- **Services and accounts** — which services we use for deployment and accounts (hosting, CI, registries, etc.), **per environment**: which account, which project/app, which env uses which
- **What to update for envs** — config, feature flags, env-specific steps (no secrets; only what to change and where)

Not for CI/CD implementation or pipeline code — that lives in the repo. This is the **reference** so we know what's live where, which service/account to use for each env, and what to push where.

## Naming

- `environments.md` — List of envs, what's deployed where, URLs
- `branch-env-mapping.md` — Which branch pushes to which env
- `services-and-accounts.md` — Services used for deployment and accounts; per env: which account, which project/app (no secrets)
- `env-and-config.md` — **Environment variables and config** the app expects (D1 binding, session secret, etc.; no secret values). Use before first deploy and for local setup.
- `env-updates.md` — What to update per env (config keys, flags, etc.; no secret values)
