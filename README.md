# md-analyzer

CLI tool that analyzes Markdown files for word count, reading time, and heading structure.

## Installation

```bash
npm install
npm run build
```

## Usage

```bash
# Analyze a Markdown file
npx md-analyzer analyze README.md

# Output as JSON
npx md-analyzer analyze README.md --json

# Custom words-per-minute
npx md-analyzer analyze README.md --wpm 250

# Shorthand (analyze is the default command)
npx md-analyzer README.md
```

## Development

```bash
npm install        # Install dependencies
npm run build      # Compile TypeScript
npm test           # Run tests
npm start          # Run the CLI (pass args after --)
```
