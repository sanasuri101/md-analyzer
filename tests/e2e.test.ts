import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const CLI_PATH = path.join(__dirname, '../dist/cli.js');

describe('CLI E2E Tests', () => {
  const testFile = path.join(__dirname, 'test-file.md');
  const testFileContent = `# Test Document

This is a test file for CLI testing.
It has multiple lines.

## Section 1

Some content here.`;

  beforeEach(() => {
    fs.writeFileSync(testFile, testFileContent);
  });

  afterEach(() => {
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  });

  it('should process file without options', () => {
    const output = execSync(`node ${CLI_PATH} ${testFile}`, { encoding: 'utf-8' });
    expect(output).toContain('Word Count:');
    expect(output).toContain('Reading Time:');
    expect(output).toContain('Headings:');
  });

  it('should process file with JSON option', () => {
    const output = execSync(`node ${CLI_PATH} ${testFile} --json`, { encoding: 'utf-8' });
    const result = JSON.parse(output);
    expect(result.wordCount).toBeGreaterThan(0);
    expect(result.readingTime).toBeDefined();
    expect(result.headings).toBeDefined();
  });

  it('should process file with WPM option', () => {
    const output = execSync(`node ${CLI_PATH} ${testFile} --wpm 100`, { encoding: 'utf-8' });
    expect(output).toContain('Word Count:');
  });

  it('should throw error for non-existent file', () => {
    expect(() => {
      execSync(`node ${CLI_PATH} non-existent-file.md`, { encoding: 'utf-8', stdio: 'pipe' });
    }).toThrow();
  });
});
