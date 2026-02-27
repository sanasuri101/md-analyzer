# PRD: md-analyzer

## 1. Introduction/Overview

**md-analyzer** is a Node.js CLI tool that analyzes Markdown files and outputs structured metrics: word count, estimated reading time, and heading structure (hierarchy). It is designed as a simple, focused utility that reads a single Markdown file and prints analysis results to stdout.

The tool targets developers and technical writers who want quick file-level analytics without spinning up a full documentation platform.

## 2. Goals

- Parse any valid Markdown file and output word count, reading time (at 200 WPM), and a hierarchical heading tree.
- Provide a clean CLI interface via `commander` with `--json` output option.
- Ship with comprehensive tests (vitest) achieving 90%+ coverage.
- Publish as an npm package with a `md-analyzer` bin entry.

## 3. User Stories

- **US-001**: As a user, I can run `md-analyzer analyze <file.md>` and see word count, reading time, and heading structure printed to the terminal.
- **US-002**: As a user, I can pass `--json` to get machine-readable JSON output.
- **US-003**: As a user, I see clear error messages when the file doesn't exist or is not valid Markdown.
- **US-004**: As a user, I can run `md-analyzer --version` and `md-analyzer --help` to see version info and usage.

## 4. Functional Requirements

### FR-001: Project Scaffolding
Set up the Node.js project with TypeScript, ESM modules, commander, and vitest.

- `package.json` with `"type": "module"`, `"bin": { "md-analyzer": "./dist/cli.js" }`
- TypeScript config (`tsconfig.json`) with strict mode, ESM output
- Directory structure:
  ```
  md-analyzer/
    src/
      cli.ts          # Commander setup, entry point
      analyzer.ts     # Core analysis logic (pure functions)
      formatter.ts    # Output formatting (text + JSON)
    tests/
      analyzer.test.ts
      formatter.test.ts
      cli.test.ts
    package.json
    tsconfig.json
    vitest.config.ts
    README.md
  ```
- Dependencies: `commander` (runtime), `typescript`, `vitest` (dev)
- Scripts: `build`, `test`, `lint`, `start`

### FR-002: Markdown Analyzer Core
Implement the core analysis functions in `src/analyzer.ts`.

- `countWords(content: string): number` — Count words in Markdown content, excluding code blocks and HTML tags.
- `calculateReadingTime(wordCount: number, wpm?: number): { minutes: number; seconds: number; text: string }` — Calculate reading time at 200 WPM (configurable). Return object with minutes, seconds, and human-readable text like "2 min read".
- `extractHeadings(content: string): Heading[]` — Parse headings from Markdown. Return array of `{ level: number; text: string; children: Heading[] }` forming a tree structure.
- `analyzeFile(filePath: string): AnalysisResult` — Read file, run all analyses, return combined result.
- Type definitions:
  ```typescript
  interface Heading {
    level: number;
    text: string;
    children: Heading[];
  }
  interface AnalysisResult {
    filePath: string;
    wordCount: number;
    readingTime: { minutes: number; seconds: number; text: string };
    headings: Heading[];
  }
  ```

### FR-003: Output Formatter
Implement output formatting in `src/formatter.ts`.

- `formatText(result: AnalysisResult): string` — Pretty-print results for terminal. Include word count, reading time, and indented heading tree.
- `formatJson(result: AnalysisResult): string` — JSON.stringify with 2-space indent.
- Example text output:
  ```
  File: README.md
  Words: 1,234
  Reading time: 6 min read

  Headings:
    # Introduction
      ## Getting Started
      ## Installation
    # Usage
      ## CLI Options
    # API Reference
  ```

### FR-004: CLI Interface
Implement the CLI entry point in `src/cli.ts` using Commander.

- Command: `md-analyzer analyze <file>` (default command)
- Options: `--json` (output as JSON), `--wpm <number>` (words per minute, default 200)
- Global: `--version`, `--help`
- Error handling: file not found (exit 1, message to stderr), not a .md file (warning but still analyze)
- Exit codes: 0 = success, 1 = error

### FR-005: Tests
Comprehensive test suite using vitest.

- `tests/analyzer.test.ts`: Test word counting (plain text, code blocks excluded, HTML excluded), reading time calculation, heading extraction (flat, nested, empty), file reading (valid file, missing file).
- `tests/formatter.test.ts`: Test text formatting output matches expected format, JSON output is valid JSON.
- `tests/cli.test.ts`: Integration tests — run CLI with test fixtures, verify stdout output, verify exit codes, verify --json flag.
- Test fixtures: Create `tests/fixtures/sample.md` with known content for deterministic tests.
- Coverage target: 90%+

## 5. Non-Goals

- No watch mode or live reloading.
- No multi-file/glob analysis (one file at a time).
- No Markdown rendering or conversion.
- No plugin system.
- No configuration files.

## 6. Technical Considerations

- **Markdown parsing**: Use regex for heading extraction (`/^(#{1,6})\s+(.+)$/gm`). Do NOT pull in a full Markdown AST parser — this is intentionally simple.
- **Word counting**: Split on whitespace after stripping code blocks (``` fenced blocks) and inline HTML tags.
- **ESM modules**: All imports use `.js` extensions. Use `node:` prefix for builtins (`node:fs`, `node:path`).
- **No external Markdown dependencies**: Keep the dependency tree minimal. Only `commander` as a runtime dep.
- **Build**: `tsc` compiles to `dist/`. The bin entry points to `dist/cli.js`.

## 7. Success Metrics

- All tests pass with 90%+ code coverage.
- `md-analyzer analyze README.md` produces correct output on any standard Markdown file.
- `md-analyzer analyze README.md --json` produces valid, parseable JSON.
- Clean `npm pack` produces installable package.
- Zero runtime dependencies beyond `commander`.
