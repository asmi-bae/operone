import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LogTool } from './LogTool';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';

describe('LogTool', () => {
  let testLogDir: string;
  let logTool: LogTool;
  let testLogFile: string;

  beforeEach(async () => {
    // Create a temporary log directory
    testLogDir = path.join(tmpdir(), `log-tool-test-${Date.now()}`);
    await fs.mkdir(testLogDir, { recursive: true });
    testLogFile = path.join(testLogDir, 'test.log');
    logTool = new LogTool([testLogDir]);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testLogDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('read operation', () => {
    it('should read log file', async () => {
      const logContent = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
      await fs.writeFile(testLogFile, logContent);

      const result = await logTool.execute({
        operation: 'read',
        logPath: testLogFile,
        lines: 3,
      });

      expect(result).toEqual(['Line 1', 'Line 2', 'Line 3']);
    });

    it('should read all lines if fewer than requested', async () => {
      const logContent = 'Line 1\nLine 2';
      await fs.writeFile(testLogFile, logContent);

      const result = await logTool.execute({
        operation: 'read',
        logPath: testLogFile,
        lines: 100,
      });

      expect(result).toHaveLength(2); // 2 lines
    });

    it('should use default lines parameter', async () => {
      const lines = Array.from({ length: 150 }, (_, i) => `Line ${i + 1}`);
      await fs.writeFile(testLogFile, lines.join('\n'));

      const result = await logTool.execute({
        operation: 'read',
        logPath: testLogFile,
      });

      expect(result).toHaveLength(100); // Default is 100
    });
  });

  describe('tail operation', () => {
    it('should return last N lines', async () => {
      const lines = Array.from({ length: 10 }, (_, i) => `Line ${i + 1}`);
      await fs.writeFile(testLogFile, lines.join('\n'));

      const result = await logTool.execute({
        operation: 'tail',
        logPath: testLogFile,
        lines: 3,
      });

      expect(result).toEqual(['Line 8', 'Line 9', 'Line 10']);
    });

    it('should filter out empty lines', async () => {
      const logContent = 'Line 1\n\nLine 2\n\n\nLine 3';
      await fs.writeFile(testLogFile, logContent);

      const result = await logTool.execute({
        operation: 'tail',
        logPath: testLogFile,
        lines: 10,
      });

      expect(result).toEqual(['Line 1', 'Line 2', 'Line 3']);
    });
  });

  describe('search operation', () => {
    it('should search for term in logs', async () => {
      const logContent = `
ERROR: Something went wrong
INFO: Application started
ERROR: Another error occurred
WARNING: Low memory
INFO: Request processed
      `.trim();
      await fs.writeFile(testLogFile, logContent);

      const result = await logTool.execute({
        operation: 'search',
        logPath: testLogFile,
        searchTerm: 'ERROR',
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toContain('Something went wrong');
      expect(result[1]).toContain('Another error occurred');
    });

    it('should be case-insensitive', async () => {
      const logContent = 'ERROR: Test\nerror: Another\nError: Third';
      await fs.writeFile(testLogFile, logContent);

      const result = await logTool.execute({
        operation: 'search',
        logPath: testLogFile,
        searchTerm: 'error',
      });

      expect(result).toHaveLength(3);
    });

    it('should return empty array if no matches', async () => {
      const logContent = 'INFO: Test\nWARNING: Another';
      await fs.writeFile(testLogFile, logContent);

      const result = await logTool.execute({
        operation: 'search',
        logPath: testLogFile,
        searchTerm: 'ERROR',
      });

      expect(result).toEqual([]);
    });

    it('should throw error without searchTerm', async () => {
      await fs.writeFile(testLogFile, 'test');

      await expect(
        logTool.execute({
          operation: 'search',
          logPath: testLogFile,
        })
      ).rejects.toThrow('searchTerm required');
    });
  });

  describe('security', () => {
    it('should only allow access to allowed log paths', async () => {
      await expect(
        logTool.execute({
          operation: 'read',
          logPath: '/etc/passwd',
        })
      ).rejects.toThrow('Access denied');
    });

    it('should prevent path traversal', async () => {
      const maliciousPath = path.join(testLogDir, '../../../etc/passwd');

      await expect(
        logTool.execute({
          operation: 'read',
          logPath: maliciousPath,
        })
      ).rejects.toThrow('Access denied');
    });

    it('should provide list of allowed paths', () => {
      const paths = logTool.getAllowedPaths();
      expect(paths).toContain(testLogDir);
    });
  });

  describe('error handling', () => {
    it('should throw error for missing logPath', async () => {
      await expect(
        logTool.execute({
          operation: 'read',
        })
      ).rejects.toThrow('logPath is required');
    });

    it('should throw error for unknown operation', async () => {
      await expect(
        logTool.execute({
          operation: 'unknown' as any,
          logPath: testLogFile,
        })
      ).rejects.toThrow('Unknown operation');
    });

    it('should throw error for non-existent log file', async () => {
      await expect(
        logTool.execute({
          operation: 'read',
          logPath: path.join(testLogDir, 'non-existent.log'),
        })
      ).rejects.toThrow();
    });
  });
});
