# md-analyzer CLI

A command-line tool for analyzing Markdown files. Extract metadata, count words, and generate reports from your Markdown documents.

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)

### Install from npm

bash
npm install -g md-analyzer

### Install from source

bash
git clone https://github.com/yourusername/md-analyzer.git
cd md-analyzer
npm install
npm link

## Usage

### Basic Usage

bash
md-analyzer <file.md>

### Options

Usage: md-analyzer [options] <file...>

Options:
  -V, --version          output the version number
  -o, --output <file>    specify output file for report (default: stdout)
  -f, --format <format>  specify output format (json, markdown, text) (default: text)
  -v, --verbose          verbose output
  -h, --help             display help for command

## Examples

### Analyze a single Markdown file

bash
md-analyzer README.md

### Analyze multiple files and generate a JSON report

bash
md-analyzer docs/*.md -o report.json -f json

### Generate a Markdown report with verbose output

bash
md-analyzer article.md -o report.md -f markdown -v

### Analyze all Markdown files in a directory

bash
md-analyzer /path/to/markdown/files/*.md

## Output Formats

### Text Format (default)

File: README.md
Word count: 245
Heading count: 5
Link count: 12
Image count: 3
Reading time: ~2 minutes

### JSON Format

json
{
  "file": "README.md",
  "wordCount": 245,
  "headingCount": 5,
  "linkCount": 12,
  "imageCount": 3,
  "readingTime": 2
}

### Markdown Format

# Analysis Report: README.md

- **Word Count**: 245
- **Heading Count**: 5
- **Link Count**: 12
- **Image Count**: 3
- **Reading Time**: ~2 minutes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.