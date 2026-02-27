import { describe, it, expect } from "vitest";
import { join } from "node:path";
import {
  countWords,
  calculateReadingTime,
  extractHeadings,
  analyzeFile,
} from "../src/analyzer.js";

describe("countWords", () => {
  it("counts words in plain text", () => {
    expect(countWords("hello world")).toBe(2);
  });

  it("counts words in multiline text", () => {
    expect(countWords("one two\nthree four\nfive")).toBe(5);
  });

  it("returns 0 for empty string", () => {
    expect(countWords("")).toBe(0);
  });

  it("returns 0 for whitespace-only string", () => {
    expect(countWords("   \n\t  ")).toBe(0);
  });

  it("excludes fenced code blocks", () => {
    const content = `Some words here.

\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`

More words after.`;
    // "Some words here." = 3, "More words after." = 3
    expect(countWords(content)).toBe(6);
  });

  it("excludes multiple fenced code blocks", () => {
    const content = `Word one.

\`\`\`
code block one
\`\`\`

Word two.

\`\`\`python
code block two
\`\`\`

Word three.`;
    // "Word one." = 2, "Word two." = 2, "Word three." = 2
    expect(countWords(content)).toBe(6);
  });

  it("strips inline HTML tags before counting", () => {
    const content = "<p>Hello</p> <strong>world</strong>";
    expect(countWords(content)).toBe(2);
  });

  it("strips self-closing HTML tags", () => {
    const content = "Hello<br/>world<hr />end";
    expect(countWords(content)).toBe(3);
  });

  it("handles markdown with mixed content", () => {
    const content = `# Heading

Some **bold** and *italic* text.

- list item one
- list item two`;
    // "# Heading" -> "Heading" = 1 word (# is not a word)
    // Wait, # followed by space: "# Heading" splits to ["#", "Heading"]
    // Actually # is a non-empty token, so it counts.
    // Let me reconsider: the issue says "Split on whitespace, filter empty strings"
    // "#" is a valid token after splitting, so it counts as a word
    // "# Heading" = 2, "Some bold and italic text." = 5, "- list item one" = 4, "- list item two" = 4
    // Total = 2 + 5 + 4 + 4 = 15
    // Actually looking more carefully: **bold** -> after stripping markdown formatting?
    // No, the spec says strip HTML tags, not markdown formatting. So **bold** remains as "**bold**" which is 1 word.
    // "# Heading" = 2, "Some **bold** and *italic* text." = 5, "- list item one" = 4, "- list item two" = 4
    expect(countWords(content)).toBe(15);
  });
});

describe("calculateReadingTime", () => {
  it("calculates reading time for a typical word count", () => {
    const result = calculateReadingTime(400);
    expect(result.minutes).toBe(2);
    expect(result.seconds).toBe(0);
    expect(result.text).toBe("2 min read");
  });

  it("calculates reading time with remainder seconds", () => {
    const result = calculateReadingTime(250);
    // 250 / 200 = 1.25 minutes = 1 min 15 sec
    expect(result.minutes).toBe(1);
    expect(result.seconds).toBe(15);
    expect(result.text).toBe("1 min read");
  });

  it("returns less than 1 min for zero words", () => {
    const result = calculateReadingTime(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);
    expect(result.text).toBe("< 1 min read");
  });

  it("returns less than 1 min for very few words", () => {
    const result = calculateReadingTime(50);
    // 50 / 200 = 0.25 min = 15 sec
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(15);
    expect(result.text).toBe("< 1 min read");
  });

  it("supports custom WPM", () => {
    const result = calculateReadingTime(300, 100);
    // 300 / 100 = 3 minutes
    expect(result.minutes).toBe(3);
    expect(result.seconds).toBe(0);
    expect(result.text).toBe("3 min read");
  });

  it("calculates correctly for 200 words at default wpm", () => {
    const result = calculateReadingTime(200);
    expect(result.minutes).toBe(1);
    expect(result.seconds).toBe(0);
    expect(result.text).toBe("1 min read");
  });
});

describe("extractHeadings", () => {
  it("extracts flat headings", () => {
    const content = `# Heading 1\n\n## Heading 2\n\n## Heading 3`;
    const headings = extractHeadings(content);
    expect(headings).toEqual([
      {
        level: 1,
        text: "Heading 1",
        children: [
          { level: 2, text: "Heading 2", children: [] },
          { level: 2, text: "Heading 3", children: [] },
        ],
      },
    ]);
  });

  it("extracts nested headings", () => {
    const content = `# Title\n\n## Section\n\n### Subsection\n\n## Another Section`;
    const headings = extractHeadings(content);
    expect(headings).toEqual([
      {
        level: 1,
        text: "Title",
        children: [
          {
            level: 2,
            text: "Section",
            children: [
              { level: 3, text: "Subsection", children: [] },
            ],
          },
          { level: 2, text: "Another Section", children: [] },
        ],
      },
    ]);
  });

  it("returns empty array for no headings", () => {
    const content = "Just some text with no headings.";
    const headings = extractHeadings(content);
    expect(headings).toEqual([]);
  });

  it("excludes headings inside fenced code blocks", () => {
    const content = `# Real Heading

\`\`\`markdown
# Fake Heading in Code
\`\`\`

## Another Real Heading`;
    const headings = extractHeadings(content);
    expect(headings).toEqual([
      {
        level: 1,
        text: "Real Heading",
        children: [
          { level: 2, text: "Another Real Heading", children: [] },
        ],
      },
    ]);
  });

  it("handles headings starting at level 2", () => {
    const content = `## First\n\n### Sub\n\n## Second`;
    const headings = extractHeadings(content);
    // Top-level should be h2s since no h1 exists
    expect(headings).toEqual([
      {
        level: 2,
        text: "First",
        children: [
          { level: 3, text: "Sub", children: [] },
        ],
      },
      { level: 2, text: "Second", children: [] },
    ]);
  });

  it("handles deeply nested headings", () => {
    const content = `# H1\n\n## H2\n\n### H3\n\n#### H4`;
    const headings = extractHeadings(content);
    expect(headings).toEqual([
      {
        level: 1,
        text: "H1",
        children: [
          {
            level: 2,
            text: "H2",
            children: [
              {
                level: 3,
                text: "H3",
                children: [
                  { level: 4, text: "H4", children: [] },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });
});

const fixturesDir = join(import.meta.dirname ?? ".", "fixtures");

describe("analyzeFile", () => {
  it("analyzes a valid markdown file", async () => {
    const filePath = join(fixturesDir, "sample.md");
    const result = await analyzeFile(filePath);

    expect(result.filePath).toBe(filePath);
    expect(result.wordCount).toBeGreaterThan(0);
    expect(result.readingTime).toHaveProperty("minutes");
    expect(result.readingTime).toHaveProperty("seconds");
    expect(result.readingTime).toHaveProperty("text");
    expect(result.headings.length).toBeGreaterThan(0);
  });

  it("throws on missing file", async () => {
    await expect(analyzeFile("/nonexistent/file.md")).rejects.toThrow();
  });

  it("throws a descriptive error for missing file", async () => {
    await expect(analyzeFile("/nonexistent/file.md")).rejects.toThrow(
      /not found|no such file|does not exist/i
    );
  });
});
