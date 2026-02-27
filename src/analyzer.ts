import { readFile } from "node:fs/promises";

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

function stripFencedCodeBlocks(content: string): string {
  return content.replace(/^```[^\n]*\n[\s\S]*?^```/gm, "");
}

export function countWords(content: string): number {
  let stripped = stripFencedCodeBlocks(content);
  stripped = stripped.replace(/<[^>]*>/g, " ");
  const words = stripped.split(/\s+/).filter((w) => w.length > 0);
  return words.length;
}

export function calculateReadingTime(
  wordCount: number,
  wpm = 200
): { minutes: number; seconds: number; text: string } {
  const totalSeconds = Math.round((wordCount / wpm) * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const text = minutes < 1 ? "< 1 min read" : `${minutes} min read`;
  return { minutes, seconds, text };
}

export function extractHeadings(content: string): Heading[] {
  const stripped = stripFencedCodeBlocks(content);
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const flat: { level: number; text: string }[] = [];

  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(stripped)) !== null) {
    flat.push({ level: match[1].length, text: match[2].trim() });
  }

  if (flat.length === 0) return [];

  const minLevel = Math.min(...flat.map((h) => h.level));

  function buildTree(
    items: { level: number; text: string }[],
    parentLevel: number
  ): Heading[] {
    const result: Heading[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.level === parentLevel) {
        const children: { level: number; text: string }[] = [];
        let j = i + 1;
        while (j < items.length && items[j].level > parentLevel) {
          children.push(items[j]);
          j++;
        }
        result.push({
          level: item.level,
          text: item.text,
          children: buildTree(children, parentLevel + 1),
        });
      }
    }

    return result;
  }

  return buildTree(flat, minLevel);
}

export async function analyzeFile(filePath: string): Promise<AnalysisResult> {
  let content: string;
  try {
    content = await readFile(filePath, "utf-8");
  } catch {
    throw new Error(`File not found: ${filePath}`);
  }

  const wordCount = countWords(content);
  const readingTime = calculateReadingTime(wordCount);
  const headings = extractHeadings(content);

  return { filePath, wordCount, readingTime, headings };
}
