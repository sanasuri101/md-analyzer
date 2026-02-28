#!/usr/bin/env node

import { Command } from "commander";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { analyzeMarkdown } from "./analyzer.js";
import { formatResults } from "./formatter.js";

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
  .action(async (file: string, options: { json: boolean; wpm: string }) => {
    try {
      const content = await readFile(file, "utf-8");
      const wpm = parseInt(options.wpm, 10);
      
      if (isNaN(wpm) || wpm <= 0) {
        console.error("Error: Words per minute must be a positive number");
        process.exit(1);
      }
      
      const results = analyzeMarkdown(content, wpm);
      const output = formatResults(results, options.json);
      
      console.log(output);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      } else {
        console.error("An unknown error occurred");
      }
      process.exit(1);
    }
  });

program.parse();