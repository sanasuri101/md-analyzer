#!/usr/bin/env node

import { Command } from "commander";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { analyzeFile, calculateReadingTime } from "./analyzer.js";
import { formatText, formatJson } from "./formatter.js";

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
      const wpm = parseInt(options.wpm, 10);

      if (isNaN(wpm) || wpm <= 0) {
        console.error("Error: Words per minute must be a positive number");
        process.exit(1);
      }

      const result = await analyzeFile(file);

      // Recalculate reading time with custom WPM if specified
      if (wpm !== 200) {
        result.readingTime = calculateReadingTime(result.wordCount, wpm);
      }

      const output = options.json ? formatJson(result) : formatText(result);
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
