import { describe, it, expect } from 'vitest';
import { countWords, calculateReadingTime, extractHeadings } from '../src/analyzer.js';

describe('countWords', () => {
  it('should count words correctly in plain text', () => {
    const content = 'This is a simple test sentence.';
    expect(countWords(content)).toBe(6); // "sentence." includes period as part of word
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

  it('should handle complex markdown content', () => {
    const content = `# Main Title

This is a paragraph with a link and inline code.

\`\`\`
function example() {
  return "Code block";
}
\`\`\`

## Subtitle

Item 1
Item 2`;
    const count = countWords(content);
    expect(count).toBeGreaterThan(0);
  });
});

describe('calculateReadingTime', () => {
  it('should calculate reading time for short content', () => {
    const result = calculateReadingTime(100);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(30);
  });

  it('should calculate reading time for medium content', () => {
    const result = calculateReadingTime(400);
    expect(result.minutes).toBe(2);
    expect(result.seconds).toBe(0);
  });

  it('should handle zero words', () => {
    const result = calculateReadingTime(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);
  });

  it('should handle custom words per minute', () => {
    const result = calculateReadingTime(300, 100);
    expect(result.minutes).toBe(3);
    expect(result.seconds).toBe(0);
  });
});

describe('extractHeadings', () => {
  it('should extract headings from markdown content', () => {
    const content = `# Main Title

## Subtitle 1

### Sub-subtitle

## Subtitle 2`;
    const headings = extractHeadings(content);
    expect(headings.length).toBeGreaterThan(0);
    expect(headings[0].text).toBe('Main Title');
    expect(headings[0].level).toBe(1);
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
    expect(headings[0].children.length).toBeGreaterThan(0);
  });
});
