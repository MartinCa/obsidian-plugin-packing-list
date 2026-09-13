# Agent instructions

Guidance for AI coding agents (and humans) working in this repository.

## Git hooks

Local hooks are installed automatically by `npm install` (the `prepare` script runs `lefthook install` — idempotent, safe to re-run).

**AI agents**: do not install the lefthook binary yourself — it is included in the OpenCode image. If `lefthook` is not on PATH, report this to the user and ask whether to install it.

Hooks come from the shared `MartinCa/lefthook-configs` fragments pinned at `v2.0.1` in `lefthook.yml`. `remotes:` configs merge _over_ `lefthook.yml`, so this repo's npm adaptation lives in `lefthook-local.yml` (the one layer that overrides remotes): it swaps the shared `format-ts` `pnpm prettier` invocation for `npx --no-install` and skips the fragment's `lint-ts` command — this repo has no ESLint setup (no `eslint` dependency, no `eslint.config.js`), Prettier only. The `format-ts` glob is extended to TS/TSX so the staged autofix covers the same file set as `npm run format:check`.

- **pre-commit** — Prettier `--write` on staged TS/TSX/JS/JSON/CSS/MD, re-staging fixed files; `lefthook-shared.yml` secret-scans the staged diff with `betterleaks` (blocks the commit on a leak) and audits staged `.github/workflows/*` files with `zizmor` (blocks on a finding).
- **commit-msg** — `commit-msg.yml` enforces Conventional Commits, e.g. `feat: ...`, `fix(api): ...`.

These hooks are the **only** enforcement of the Prettier autofix, the secret scan, and Conventional-Commits checks. CI runs `npm run format:check` (Prettier check), `npx tsc --noEmit --skipLibCheck`, and the esbuild build as blocking gates, and uploads a zizmor SARIF report to code scanning — a non-blocking SARIF upload, not a merge gate. CI does not run Prettier `--write`, `betterleaks`, or commit-msg validation itself. Do not bypass the hooks.

Two hook tools must be on `PATH`: `betterleaks` (secret scan, install per its project README) and `zizmor` (workflow audit, install from zizmor.sh). If a tool is missing, `LEFTHOOK=0 git commit` skips the hooks entirely — a pragmatic escape hatch for restricted setups, not a way to dodge the gates.

`lefthook-local.yml` is **intentionally checked in** as this repo's team-wide override: in a stock lefthook setup that file is the personal, gitignored override layer, but here it is the one layer that merges _over_ the shared `remotes:` fragments and it carries the repo-wide npm adaptation (working around the pnpm assumption in the shared TS fragment — see https://github.com/MartinCa/lefthook-configs/issues/1). It is not a personal override layer in this repo; do not use it for private changes. Keep dependencies on npm — never add a `pnpm-lock.yaml` to this repo (gitignored).
