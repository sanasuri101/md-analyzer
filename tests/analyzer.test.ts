import { describe, it, expect, beforeEach } from 'vitest';
import { countWords, calculateReadingTime, extractHeadings } from './file';

describe('countWords', () => {
  it('should count words correctly in plain text', () => {
    const content = 'This is a simple test sentence.';
    expect(countWords(content)).toBe(5);
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

  it('should ignore inline code', () => {
    const content = 'This is a `test` sentence with `inline code`.';
    expect(countWords(content)).toBe(6);
  });

  it('should preserve link text but remove URLs', () => {
    const content = 'Check out [this link](https://example.com) for more info.';
    expect(countWords(content)).toBe(7);
  });

  it('should remove images but preserve alt text', () => {
    const content = 'This is ![an image](image.jpg) with alt text.';
    expect(countWords(content)).toBe(6);
  });

  it('should remove heading markers but keep text', () => {
    const content = `
# Heading 1
## Heading 2
### Heading 3
`;
    expect(countWords(content)).toBe(3);
  });

  it('should remove markdown symbols', () => {
    const content = 'This is *italic*, **bold**, and ~strikethrough~ text.';
    expect(countWords(content)).toBe(7);
  });

  it('should handle complex markdown content', () => {
    const content = `
# Main Title

This is a paragraph with [a link](https://example.com) and `inline code`.

\`\`\`
function example() {
  return "Code block";
}
\`\`\`

## Subtitle

- Item 1
- Item 2

> This is a blockquote.

![Image](image.jpg)
`;
    expect(countWords(content)).toBe(22);
  });

  it('should handle hyphenated words as single words', () => {
    const content = 'This is a well-formatted sentence.';
    expect(countWords(content)).toBe(5);
  });

  it('should handle apostrophes correctly', () => {
    const content = "This is John's book.";
    expect(countWords(content)).toBe(4);
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

  it('should calculate reading time for long content', () => {
    const result = calculateReadingTime(1300);
    expect(result.minutes).toBe(6);
    expect(result.seconds).toBe(30);
    expect(result.text).toBe('6 minutes 30 seconds');
  });

  it('should handle zero words', () => {
    const result = calculateReadingTime(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);
    expect(result.text).toBe('');
  });

  it('should handle custom words per minute', () => {
    const result = calculateReadingTime(300, 100);
    expect(result.minutes).toBe(3);
    expect(result.seconds).toBe(0);
    expect(result.text).toBe('3 minutes');
  });

  it('should round seconds correctly', () => {
    const result = calculateReadingTime(333, 200);
    expect(result.minutes).toBe(1);
    expect(result.seconds).toBe(40);
    expect(result.text).toBe('1 minute 40 seconds');
  });

  it('should handle single minute case', () => {
    const result = calculateReadingTime(200);
    expect(result.minutes).toBe(1);
    expect(result.seconds).toBe(0);
    expect(result.text).toBe('1 minute');
  });

  it('should handle single second case', () => {
    const result = calculateReadingTime(1);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(1);
    expect(result.text).toBe('1 second');
  });
});

describe('extractHeadings', () => {
  it('should extract headings from markdown content', () => {
    const content = `
# Main Title

## Subtitle 1

### Sub-subtitle

## Subtitle 2

### Another sub-subtitle

#### Deep level
`;
    const headings = extractHeadings(content);
    expect(headings).toEqual([
      {
        level: 1,
        text: 'Main Title',
        children: [
          {
            level: 2,
            text: 'Subtitle 1',
            children: [
              {
                level: 3,
                text: 'Sub-subtitle',
                children: []
              }
            ]
          },
          {
            level: 2,
            text: 'Subtitle 2',
            children: [
              {
                level: 3,
                text: 'Another sub-subtitle',
                children: [
                  {
                    level: 4,
                    text: 'Deep level',
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      }
    ]);
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

  it('should handle headings with markdown in text', () => {
    const content = `
# Title with *italic* and **bold**

## Subtitle with [link](https://example.com)
`;
    const headings = extractHeadings(content);
    expect(headings).toEqual([
      {
        level: 1,
        text: 'Title with italic and bold',
        children: [
          {
            level: 2,
            text: 'Subtitle with link',
            children: []
          }
        ]
      }
    ]);
  });

  it('should handle malformed heading syntax', () => {
    const content = `
# Valid heading

## Not a heading (missing space after hashes)

### Another valid heading

#### Valid heading with extra spaces ####

##### Valid heading with trailing text #####
`;
    const headings = extractHeadings(content);
    expect(headings).toEqual([
      {
        level: 1,
        text: 'Valid heading',
        children: []
      },
      {
        level: 3,
        text: 'Another valid heading',
        children: []
      },
      {
        level: 4,
        text: 'Valid heading with extra spaces',
        children: []
      },
      {
        level: 5,
        text: 'Valid heading with trailing text',
        children: []
      }
    ]);
  });

  it('should handle heading with code', () => {
    const content = `
# Heading with \`code\`

## Heading with \`inline code\`
`;
    const headings = extractHeadings(content);
    expect(headings).toEqual([
      {
        level: 1,
        text: 'Heading with code',
        children: [
          {
            level: 2,
            text: 'Heading with inline code',
            children: []
          }
        ]
      }
    ]);
  });

  it('should handle complex nested headings', () => {
    const content = `
# Level 1

## Level 2.1

### Level 3.1

#### Level 4.1

#### Level 4.2

### Level 3.2

## Level 2.2
`;
    const headings = extractHeadings(content);
    expect(headings).toEqual([
      {
        level: 1,
        text: 'Level 1',
        children: [
          {
            level: 2,
            text: 'Level 2.1',
            children: [
              {
                level: 3,
                text: 'Level 3.1',
                children: [
                  {
                    level: 4,
                    text: 'Level 4.1',
                    children: []
                  },
                  {
                    level: 4,
                    text: 'Level 4.2',
                    children: []
                  }
                ]
              },
              {
                level: 3,
                text: 'Level 3.2',
                children: []
              }
            ]
          },
          {
            level: 2,
            text: 'Level 2.2',
            children: []
          }
        ]
      }
    ]);
  });
});