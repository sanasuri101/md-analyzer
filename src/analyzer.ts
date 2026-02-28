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

export function countWords(content: string): number {
  // Remove code blocks
  let cleanContent = content.replace(/```[\s\S]*?```/g, '');
  // Remove inline code
  cleanContent = cleanContent.replace(/`[^`]+`/g, '');
  // Remove markdown links but keep text
  cleanContent = cleanContent.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Remove images
  cleanContent = cleanContent.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');
  // Remove heading markers
  cleanContent = cleanContent.replace(/^#{1,6}\s+/gm, '');
  // Remove other markdown symbols
  cleanContent = cleanContent.replace(/[#*~_`]/g, '');
  
  // Split by whitespace and filter out empty strings
  const words = cleanContent.split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

export function calculateReadingTime(
  wordCount: number,
  wpm: number = 200
): { minutes: number; seconds: number; text: string } {
  const totalSeconds = Math.round((wordCount / wpm) * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  let text = '';
  if (minutes > 0) {
    text += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    if (seconds > 0) {
      text += ' ';
    }
  }
  if (seconds > 0 || minutes === 0) {
    text += `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  
  return { minutes, seconds, text };
}

export function extractHeadings(content: string): Heading[] {
  const root: Heading = { level: 0, text: 'root', children: [] };
  const stack: Heading[] = [root];
  
  const lines = content.split('\n');
  
  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      
      const newHeading: Heading = {
        level,
        text,
        children: []
      };
      
      // Find the correct parent
      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }
      
      stack[stack.length - 1].children.push(newHeading);
      stack.push(newHeading);
    }
  }
  
  return root.children;
}

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
