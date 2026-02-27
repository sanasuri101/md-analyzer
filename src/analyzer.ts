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

export function countWords(_content: string): number {
  throw new Error("Not yet implemented");
}

export function calculateReadingTime(
  _wordCount: number,
  _wpm?: number
): { minutes: number; seconds: number; text: string } {
  throw new Error("Not yet implemented");
}

export function extractHeadings(_content: string): Heading[] {
  throw new Error("Not yet implemented");
}

export async function analyzeFile(_filePath: string): Promise<AnalysisResult> {
  throw new Error("Not yet implemented");
}
