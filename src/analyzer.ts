import { readFile } from 'node:fs/promises';

export interface Heading {
  level: number;
  text: string;
  children: Heading[];
}

export interface AnalysisResult {
  filePath: string;
  wordCount: number;
  readingTime: { minutes: number; seconds: number; text: string };
  headings: Heading[];
}

/**
 * Count words in markdown content
 * Handles: code blocks, inline code, links, images, HTML tags, frontmatter, tables
 */
export function countWords(content: string): number {
  let cleanContent = content;

  // Remove YAML frontmatter (--- ... ---)
  cleanContent = cleanContent.replace(/^---[\s\S]*?---\n?/g, '');

  // Remove fenced code blocks (``` ... ```)
  cleanContent = cleanContent.replace(/```[\s\S]*?```/g, '');

  // Remove inline code (`...`)
  cleanContent = cleanContent.replace(/`[^`]+`/g, '');

  // Remove markdown links but keep text [text](url) -> text
  cleanContent = cleanContent.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove images ![alt](url)
  cleanContent = cleanContent.replace(/!\[[^\]]*\]\([^)]+\)/g, '');

  // Remove HTML tags
  cleanContent = cleanContent.replace(/<[^>]+>/g, '');

  // Remove heading markers (# ...), but keep the text
  cleanContent = cleanContent.replace(/^#{1,6}\s+/gm, '');

  // Remove table formatting (|, -, :)
  cleanContent = cleanContent.replace(/\|[-:]+\|/g, '');
  cleanContent = cleanContent.replace(/\|/g, ' ');

  // Remove markdown formatting symbols (*, _, ~)
  cleanContent = cleanContent.replace(/[*_~]+/g, '');

  // Remove blockquote markers (>)
  cleanContent = cleanContent.replace(/^>\s*/gm, '');

  // Remove list markers (-, *, +, 1.)
  cleanContent = cleanContent.replace(/^[\s]*[-*+]\s+/gm, '');
  cleanContent = cleanContent.replace(/^[\s]*\d+\.\s+/gm, '');

  // Remove horizontal rules (---, ***)
  cleanContent = cleanContent.replace(/^[-*]{3,}$/gm, '');

  // Remove footnote references [^1]
  cleanContent = cleanContent.replace(/\[\^[^\]]+\]/g, '');

  // Split by whitespace and filter empty strings
  const words = cleanContent.split(/\s+/).filter(word => {
    // Filter out empty strings and pure punctuation
    return word.length > 0 && !/^[^\w]+$/.test(word);
  });

  return words.length;
}

/**
 * Calculate reading time from word count
 * @param wordCount - Number of words
 * @param wpm - Words per minute (default: 200)
 * @returns Object with minutes, seconds, and formatted text
 */
export function calculateReadingTime(
  wordCount: number,
  wpm: number = 200
): { minutes: number; seconds: number; text: string } {
  // Validate inputs
  if (wordCount < 0) wordCount = 0;
  if (wpm <= 0) wpm = 200;

  const totalSeconds = Math.round((wordCount / wpm) * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Generate consistent text formatting
  const text = formatReadingTimeText(minutes, seconds);

  return { minutes, seconds, text };
}

/**
 * Format reading time as human-readable text
 * Ensures consistent formatting across all cases
 */
function formatReadingTimeText(minutes: number, seconds: number): string {
  const parts: string[] = [];

  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  }

  if (seconds > 0) {
    parts.push(`${seconds} ${seconds === 1 ? 'second' : 'seconds'}`);
  }

  // If both are 0, show "less than 1 second"
  if (parts.length === 0) {
    return 'less than 1 second';
  }

  return parts.join(' ');
}

/**
 * Extract headings from markdown content with tree structure
 */
export function extractHeadings(content: string): Heading[] {
  const root: Heading = { level: 0, text: 'root', children: [] };
  const stack: Heading[] = [root];

  const lines = content.split('\n');

  for (const line of lines) {
    // Match ATX-style headings (# Heading)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const rawText = headingMatch[2].trim();

      // Clean heading text (remove trailing # if present, remove formatting)
      const text = rawText
        .replace(/\s*#+\s*$/, '') // Remove trailing #
        .replace(/[*_`]+/g, '')   // Remove formatting
        .trim();

      const newHeading: Heading = {
        level,
        text,
        children: []
      };

      // Find the correct parent by popping stack until we find a lower level
      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      stack[stack.length - 1].children.push(newHeading);
      stack.push(newHeading);
    }
  }

  return root.children;
}

/**
 * Analyze a markdown file and return complete analysis
 */
export async function analyzeFile(filePath: string): Promise<AnalysisResult> {
  const content = await readFile(filePath, 'utf-8');

  const wordCount = countWords(content);
  const readingTime = calculateReadingTime(wordCount);
  const headings = extractHeadings(content);

  return {
    filePath,
    wordCount,
    readingTime,
    headings
  };
}
