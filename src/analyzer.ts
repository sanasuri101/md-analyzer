import { promises as fs } from 'fs';
import { parse } from 'markdown-to-jsx';

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
  // Remove markdown links and images, then split by whitespace
  const cleanContent = content
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links but keep text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Remove images but keep alt text
    .replace(/[#*~_`]/g, ''); // Remove common markdown symbols
  
  // Split by whitespace and filter out empty strings
  const words = cleanContent.split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

export function calculateReadingTime(
  wordCount: number,
  wpm: number = 200
): { minutes: number; seconds: number; text: string } {
  // Calculate minutes and seconds based on words per minute
  const minutes = Math.floor(wordCount / wpm);
  const seconds = Math.round(((wordCount % wpm) / wpm) * 60);
  
  // Create readable text
  let text = '';
  if (minutes > 0) {
    text += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    if (seconds > 0) {
      text += ' ';
    }
  }
  if (seconds > 0) {
    text += `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  
  return { minutes, seconds, text };
}

export function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const stack: Heading[] = [];
  
  // Parse markdown content and process headings
  const root = {
    level: 0,
    text: 'root',
    children: [] as Heading[]
  };
  
  stack.push(root);
  
  // Split content by lines and process each line
  const lines = content.split('\n');
  
  for (const line of lines) {
    // Check if line is a heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      
      const newHeading: Heading = {
        level,
        text,
        children: []
      };
      
      // Find the correct parent in the stack
      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }
      
      // Add the new heading to its parent's children
      stack[stack.length - 1].children.push(newHeading);
      
      // Push the new heading to the stack
      stack.push(newHeading);
    }
  }
  
  // Return the root's children (top-level headings)
  return root.children;
}

export async function analyzeFile(filePath: string): Promise<AnalysisResult> {
  try {
    // Read the file content
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Calculate word count
    const wordCount = countWords(content);
    
    // Calculate reading time
    const readingTime = calculateReadingTime(wordCount);
    
    // Extract headings
    const headings = extractHeadings(content);
    
    // Return the analysis result
    return {
      filePath,
      wordCount,
      readingTime,
      headings
    };
  } catch (error) {
    throw new Error(`Failed to analyze file: ${error instanceof Error ? error.message : String(error)}`);
  }
}