# Giselle Development Guide

## Build, Test, and Lint Commands
- Build all: `pnpm build`
- Build specific packages: `pnpm build-sdk`, `pnpm build-data-type`
- Type checking: `pnpm check-types`
- Format code: `pnpm format`
- Development: `pnpm dev` (playground), `pnpm dev:studio.giselles.ai` (studio)
- Run tests: `pnpm -F <package> test` or `cd <directory> && vitest`
- Run specific test: `cd <directory> && vitest <file.test.ts>`
- Lint: `cd <directory> && biome check --write .`
- Format modified files: `pnpm biome check --write [filename]`

## Critical Requirements
- MUST run `pnpm biome check --write [filename]` after EVERY code modification
- All code changes must be formatted using Biome before being committed

## Code Style Guidelines
- Use Biome for formatting with tab indentation and double quotes
- Follow organized imports pattern (enabled in biome.json)
- Use TypeScript for type safety; avoid `any` types
- Use functional components with React hooks
- Use Next.js patterns for web applications
- Follow package-based architecture for modularity
- File naming: kebab-case for files, PascalCase for components, camelCase for variables
- Use async/await for asynchronous code rather than promises
- Error handling: use try/catch blocks and propagate errors appropriately
- Tests should follow `*.test.ts` naming pattern and use Vitest

## Language Support
- This project's core members include non-native English speakers
- Please correct grammar in commit messages, code comments, and pull request comments
- Rewrite user input when necessary to ensure clear communication