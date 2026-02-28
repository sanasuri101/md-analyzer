import type { AnalysisResult } from "./analyzer.js";

export function formatText(result: AnalysisResult): string {
  let output = `\n`;
  output += `📄 File: ${result.filePath}\n`;
  output += `📊 Word Count: ${result.wordCount}\n`;
  output += `⏱️  Reading Time: ${result.readingTime.text}\n`;
  output += `\n`;
  
  if (result.headings.length > 0) {
    output += `📑 Headings:\n`;
    output += formatHeadings(result.headings, 0);
  } else {
    output += `📑 No headings found\n`;
  }
  
  return output;
}

function formatHeadings(headings: AnalysisResult['headings'], indent: number): string {
  let output = '';
  const prefix = '  '.repeat(indent);
  
  for (const heading of headings) {
    output += `${prefix}${'#'.repeat(heading.level)} ${heading.text}\n`;
    if (heading.children.length > 0) {
      output += formatHeadings(heading.children, indent + 1);
    }
  }
  
  return output;
}

export function formatJson(result: AnalysisResult): string {
  return JSON.stringify(result, null, 2);
}
