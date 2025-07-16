# Philosophy: **Less is more**
Keep every implementation as small and obvious as possible.
- Prefer the simplest data structures and APIs that work.
- Avoid needless abstractions; refactor only when duplication hurts.
- Remove dead code early — `pnpm tidy` scans the repo for unused files/deps and lets you delete them in one command.
- Before adding a dependency, ask, “Can we do this with what we already have?”

# Workflow
**MANDATORY**: After every code change, you MUST immediately run these commands in order:

1. `pnpm format`
2. `pnpm tidy`
3. `pnpm check-types`
4. `pnpm test`

**DO NOT consider any code change complete until all four commands pass successfully.**

(CI also runs these steps; your PR will fail if any step fails.)


# Bash commands
- pnpm build-sdk: build the SDK packages
- pnpm -F playground build: build the playground app
- pnpm -F studio.giselles.ai build: build Giselle Cloud
- pnpm check-types: type‑check the project
- pnpm format: format code
- pnpm tidy --fix: delete unused files/dependencies
- pnpm tidy: diagnose unused files/dependencies
- pnpm test: run tests

# Code Style

- **Consistency wins** – follow existing naming and file‑layout patterns; if you must diverge, document why.
- **Explicit over implicit** – favor clear, descriptive names and type annotations over clever tricks. Future you—or a teammate—should understand the code at a glance.
- **Fail fast** – validate inputs, throw early, and surface actionable errors. The sooner something explodes in dev, the fewer surprises in prod.
- **Let the code speak** – if you need a multi‑paragraph comment, refactor until intent is obvious.

# Language Support
- Some core members are non‑native English speakers.
- Please correct grammar in commit messages, code comments, and PR discussions.
- Rewrite unclear user input when necessary to ensure smooth communication.
