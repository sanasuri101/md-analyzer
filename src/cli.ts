#!/usr/bin/env node

import { Command } from "commander";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkgPath = join(__dirname, "..", "package.json");
const pkg = JSON.parse(await readFile(pkgPath, "utf-8")) as { version: string };

const program = new Command();

program
  .name("md-analyzer")
  .description("CLI tool that analyzes Markdown files for word count, reading time, and heading structure")
  .version(pkg.version);

program
  .command("analyze", { isDefault: true })
  .description("Analyze a Markdown file")
  .argument("<file>", "Markdown file to analyze")
  .option("--json", "Output results as JSON", false)
  .option("--wpm <number>", "Words per minute for reading time", "200")
  .action((_file: string, _options: { json: boolean; wpm: string }) => {
    console.log("Not yet implemented");
  });

program.parse();
