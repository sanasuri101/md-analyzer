import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const CLI_PATH = path.join(__dirname, '../../dist/cli.js');

describe('CLI E2E Tests', () => {
  const testFile = path.join(__dirname, 'test-file.txt');
  const testFileContent = 'This is a test file for CLI testing.\nIt has multiple lines.\nAnd some words to test WPM calculation.';

  beforeEach(() => {
    // Create a test file before each test
    fs.writeFileSync(testFile, testFileContent);
  });

  afterEach(() => {
    // Clean up the test file after each test
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  });

  test('should process file without options', () => {
    const output = execSync(`node ${CLI_PATH} ${testFile}`, { encoding: 'utf-8' });
    expect(output).toContain('Words: 14');
    expect(output).toContain('Characters: 70');
  });

  test('should process file with JSON option', () => {
    const output = execSync(`node ${CLI_PATH} ${testFile} --json`, { encoding: 'utf-8' });
    const result = JSON.parse(output);
    expect(result.words).toBe(14);
    expect(result.characters).toBe(70);
  });

  test('should process file with WPM option', () => {
    const output = execSync(`node ${CLI_PATH} ${testFile} --wpm 200`, { encoding: 'utf-8' });
    expect(output).toContain('Words: 14');
    expect(output).toContain('Characters: 70');
    expect(output).toContain('Estimated reading time: 0.07 minutes');
  });

  test('should process file with both JSON and WPM options', () => {
    const output = execSync(`node ${CLI_PATH} ${testFile} --json --wpm 150`, { encoding: 'utf-8' });
    const result = JSON.parse(output);
    expect(result.words).toBe(14);
    expect(result.characters).toBe(70);
    expect(result.estimatedReadingTime).toBe(0.09333333333333333);
  });

  test('should throw error for non-existent file', () => {
    expect(() => {
      execSync(`node ${CLI_PATH} non-existent-file.txt`, { encoding: 'utf-8' });
    }).toThrow();
  });

  test('should throw error for invalid WPM value', () => {
    expect(() => {
      execSync(`node ${CLI_PATH} ${testFile} --wpm -1`, { encoding: 'utf-8' });
    }).toThrow();
  });
});