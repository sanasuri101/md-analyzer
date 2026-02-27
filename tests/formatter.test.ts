import { describe, it, expect } from "vitest";
import { formatText, formatJson } from "../src/formatter.js";
import type { AnalysisResult } from "../src/analyzer.js";

function makeResult(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    filePath: "README.md",
    wordCount: 1234,
    readingTime: { minutes: 6, seconds: 10, text: "6 min read" },
    headings: [
      {
        level: 1,
        text: "Introduction",
        children: [
          { level: 2, text: "Getting Started", children: [] },
          { level: 2, text: "Installation", children: [] },
        ],
      },
      {
        level: 1,
        text: "Usage",
        children: [
          { level: 2, text: "CLI Options", children: [] },
        ],
      },
    ],
    ...overrides,
  };
}

describe("formatText", () => {
  it("produces expected output format with known input", () => {
    const result = makeResult();
    const output = formatText(result);

    expect(output).toContain("File: README.md");
    expect(output).toContain("Words: 1,234");
    expect(output).toContain("Reading time: 6 min read");
    expect(output).toContain("Headings:");
    expect(output).toContain("  # Introduction");
    expect(output).toContain("    ## Getting Started");
    expect(output).toContain("    ## Installation");
    expect(output).toContain("  # Usage");
    expect(output).toContain("    ## CLI Options");
  });

  it("handles zero words", () => {
    const result = makeResult({
      wordCount: 0,
      readingTime: { minutes: 0, seconds: 0, text: "0 min read" },
    });
    const output = formatText(result);

    expect(output).toContain("Words: 0");
    expect(output).toContain("Reading time: 0 min read");
  });

  it("handles no headings", () => {
    const result = makeResult({ headings: [] });
    const output = formatText(result);

    expect(output).toContain("Headings: (none)");
  });

  it("formats word count with commas for thousands", () => {
    const result = makeResult({ wordCount: 1000000 });
    const output = formatText(result);

    expect(output).toContain("Words: 1,000,000");
  });

  it("indents headings by 2 spaces per level", () => {
    const result = makeResult({
      headings: [
        {
          level: 1,
          text: "Top",
          children: [
            {
              level: 2,
              text: "Mid",
              children: [
                { level: 3, text: "Deep", children: [] },
              ],
            },
          ],
        },
      ],
    });
    const output = formatText(result);

    expect(output).toContain("  # Top");
    expect(output).toContain("    ## Mid");
    expect(output).toContain("      ### Deep");
  });
});

describe("formatJson", () => {
  it("produces valid parseable JSON", () => {
    const result = makeResult();
    const output = formatJson(result);

    expect(() => JSON.parse(output)).not.toThrow();
  });

  it("round-trips (parse output matches input)", () => {
    const result = makeResult();
    const output = formatJson(result);
    const parsed = JSON.parse(output) as AnalysisResult;

    expect(parsed).toEqual(result);
  });

  it("uses 2-space indentation", () => {
    const result = makeResult();
    const output = formatJson(result);

    // JSON.stringify with 2-space indent produces lines starting with "  "
    const lines = output.split("\n");
    const indentedLines = lines.filter((l) => l.startsWith("  "));
    expect(indentedLines.length).toBeGreaterThan(0);
  });
});
