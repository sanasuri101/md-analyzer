import type { AnalysisResult } from "./analyzer.js";

export function formatText(result: AnalysisResult): string {
  if (!result || !result.files || result.files.length === 0) {
    return "No analysis results available.";
  }

  let output = `Analysis Results:\n`;
  output += `Total files analyzed: ${result.files.length}\n`;
  output += `Issues found: ${result.issues?.length || 0}\n\n`;

  if (result.issues && result.issues.length > 0) {
    output += "Issues:\n";
    result.issues.forEach((issue, index) => {
      output += `${index + 1}. [${issue.severity}] ${issue.message}\n`;
      output += `   File: ${issue.file}\n`;
      output += `   Line: ${issue.line}, Column: ${issue.column}\n`;
      if (issue.rule) {
        output += `   Rule: ${issue.rule}\n`;
      }
      output += "\n";
    });
  }

  if (result.summary) {
    output += "Summary:\n";
    for (const [key, value] of Object.entries(result.summary)) {
      output += `${key}: ${value}\n`;
    }
  }

  return output;
}

export function formatJson(result: AnalysisResult): string {
  return JSON.stringify(result, null, 2);
}