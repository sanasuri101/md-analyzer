# CLAUDE.md — md-analyzer

## Project Overview

md-analyzer is a Node.js CLI tool that reads a Markdown file and outputs word count, estimated reading time, and heading structure. It uses Commander for CLI argument parsing and vitest for testing. Zero external Markdown parsing dependencies — just regex-based analysis.

## Tech Stack

- Node.js 20+, TypeScript (strict mode, ESM)
- Commander.js for CLI
- Vitest for testing
- No Markdown AST parser — regex-based intentionally

## Project Structure

```
src/
  cli.ts           # Commander entry point, default command: analyze <file>
  analyzer.ts      # Pure functions: countWords, calculateReadingTime, extractHeadings, analyzeFile
  formatter.ts     # formatText (terminal), formatJson (machine-readable)
tests/
  analyzer.test.ts
  formatter.test.ts
  cli.test.ts      # Integration tests (runs built CLI binary)
  e2e.test.ts      # End-to-end with complex fixtures
  fixtures/
    sample.md
    complex.md
```

## Dev Commands

```bash
npm install        # Install deps
npm run build      # tsc → dist/
npm test           # vitest
npm start          # node dist/cli.js (pass args after --)
```

## Code Conventions

- **ESM modules** — `"type": "module"` in package.json
- **`.js` extensions in imports** — `import { foo } from "./bar.js"` (required for ESM)
- **`node:` prefix for builtins** — `import { readFile } from "node:fs/promises"`
- **Strict TypeScript** — no `any`, use `unknown` + type guards
- **Semicolons, double quotes, 2-space indent**

## Testing

- vitest with coverage
- Unit tests for analyzer.ts and formatter.ts
- Integration tests for cli.ts (run actual binary with execFile)
- Test fixtures in tests/fixtures/ with known expected values
- Target: 90%+ coverage

## Gotchas

- Build before running CLI: `npm run build` then `node dist/cli.js`
- The bin entry is `dist/cli.js` — must build first
- Code blocks (``` fenced) must be stripped before counting words or extracting headings
- Use `execFile` not `exec` in tests for running the CLI
