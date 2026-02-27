import type { AnalysisResult, Heading } from "./analyzer.js";

function formatHeadingLines(headings: Heading[]): string[] {
  const lines: string[] = [];
  for (const heading of headings) {
    const indent = "  ".repeat(heading.level);
    const hashes = "#".repeat(heading.level);
    lines.push(`${indent}${hashes} ${heading.text}`);
    lines.push(...formatHeadingLines(heading.children));
  }
  return lines;
}

export function formatText(result: AnalysisResult): string {
  const lines: string[] = [
    `File: ${result.filePath}`,
    `Words: ${result.wordCount.toLocaleString("en-US")}`,
    `Reading time: ${result.readingTime.text}`,
    "",
  ];

  if (result.headings.length === 0) {
    lines.push("Headings: (none)");
  } else {
    lines.push("Headings:");
    lines.push(...formatHeadingLines(result.headings));
  }

  return lines.join("\n");
}

export function formatJson(result: AnalysisResult): string {
  return JSON.stringify(result, null, 2);
}
