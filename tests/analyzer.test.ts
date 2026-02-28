import { describe, it, expect } from 'vitest';
import { countWords, calculateReadingTime, extractHeadings } from '../src/analyzer.js';

describe('countWords', () => {
  it('should count words correctly in plain text', () => {
    const content = 'This is a simple test sentence.';
    expect(countWords(content)).toBe(6);
  });

  it('should handle empty content', () => {
    expect(countWords('')).toBe(0);
  });

  it('should handle content with only whitespace', () => {
    expect(countWords('   \n \t \r \n')).toBe(0);
  });

  it('should ignore code blocks', () => {
    const content = `
This is a paragraph.

\`\`\`
function test() {
  console.log("Hello");
}
\`\`\`

This is another paragraph.
`;
    expect(countWords(content)).toBe(8);
  });

  it('should preserve link text but remove URLs', () => {
    const content = 'Check out [this link](https://example.com) for more info.';
    expect(countWords(content)).toBe(7);
  });

  it('should remove heading markers but keep text', () => {
    const content = `# Heading 1
## Heading 2
### Heading 3`;
    expect(countWords(content)).toBe(6);
  });

  it('should remove YAML frontmatter', () => {
    const content = `---
title: Test
date: 2024-01-01
---

This is content.`;
    // Frontmatter is removed, only "This is content" remains
    const count = countWords(content);
    expect(count).toBeLessThanOrEqual(5);
  });

  it('should remove HTML tags', () => {
    const content = '<p>This is <strong>bold</strong> text</p>';
    expect(countWords(content)).toBe(4);
  });

  it('should remove table formatting', () => {
    const content = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`;
    // Table dividers are removed, just the text content
    const count = countWords(content);
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(20);
  });

  it('should remove list markers', () => {
    const content = `- Item 1
- Item 2
* Item 3
1. Item 4`;
    // List markers are removed, but "Item" and numbers are counted
    const count = countWords(content);
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(12); // Should be less than if markers were words
  });
});

describe('calculateReadingTime', () => {
  it('should calculate reading time for short content', () => {
    const result = calculateReadingTime(100);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(30);
    expect(result.text).toBe('30 seconds');
  });

  it('should calculate reading time for medium content', () => {
    const result = calculateReadingTime(400);
    expect(result.minutes).toBe(2);
    expect(result.seconds).toBe(0);
    expect(result.text).toBe('2 minutes');
  });

  it('should handle zero words', () => {
    const result = calculateReadingTime(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);
    expect(result.text).toBe('less than 1 second');
  });

  it('should handle custom words per minute', () => {
    const result = calculateReadingTime(300, 100);
    expect(result.minutes).toBe(3);
    expect(result.seconds).toBe(0);
  });

  it('should handle negative word count gracefully', () => {
    const result = calculateReadingTime(-10);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);
  });

  it('should handle invalid WPM gracefully', () => {
    const result = calculateReadingTime(200, 0);
    expect(result.minutes).toBe(1);
    expect(result.seconds).toBe(0);
  });

  it('should format 1 minute correctly (singular)', () => {
    const result = calculateReadingTime(200);
    expect(result.text).toBe('1 minute');
  });

  it('should format 1 second correctly (singular)', () => {
    const result = calculateReadingTime(3);
    expect(result.text).toBe('1 second');
  });

  it('should format mixed time correctly', () => {
    const result = calculateReadingTime(250);
    expect(result.text).toBe('1 minute 15 seconds');
  });
});

describe('extractHeadings', () => {
  it('should extract headings from markdown content', () => {
    const content = `# Main Title

## Subtitle 1

### Sub-subtitle

## Subtitle 2`;
    const headings = extractHeadings(content);
    expect(headings.length).toBe(1);
    expect(headings[0].text).toBe('Main Title');
    expect(headings[0].level).toBe(1);
    expect(headings[0].children.length).toBe(2);
  });

  it('should handle content with no headings', () => {
    const content = 'This is just a paragraph with no headings.';
    const headings = extractHeadings(content);
    expect(headings).toEqual([]);
  });

  it('should handle empty content', () => {
    const headings = extractHeadings('');
    expect(headings).toEqual([]);
  });

  it('should build heading tree correctly', () => {
    const content = `# Level 1

## Level 2

### Level 3`;
    const headings = extractHeadings(content);
    expect(headings[0].children[0].children[0].text).toBe('Level 3');
  });

  it('should handle multiple top-level headings', () => {
    const content = `# First
# Second
## Under Second`;
    const headings = extractHeadings(content);
    expect(headings.length).toBe(2);
  });
});
