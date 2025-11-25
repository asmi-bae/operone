import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileTool } from './FileTool';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';

describe('FileTool', () => {
  let testDir: string;
  let fileTool: FileTool;

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = path.join(tmpdir(), `file-tool-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    fileTool = new FileTool([testDir]);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('read operation', () => {
    it('should read existing file', async () => {
      const testFile = path.join(testDir, 'test.txt');
      const content = 'Hello, World!';
      await fs.writeFile(testFile, content);

      const result = await fileTool.execute({
        operation: 'read',
        filePath: testFile,
      });

      expect(result).toBe(content);
    });

    it('should throw error for non-existent file', async () => {
      const nonExistentFile = path.join(testDir, 'non-existent.txt');

      await expect(
        fileTool.execute({
          operation: 'read',
          filePath: nonExistentFile,
        })
      ).rejects.toThrow();
    });

    it('should throw error for file outside allowed paths', async () => {
      const outsideFile = '/tmp/outside.txt';

      await expect(
        fileTool.execute({
          operation: 'read',
          filePath: outsideFile,
        })
      ).rejects.toThrow('Access denied');
    });
  });

  describe('write operation', () => {
    it('should write content to new file', async () => {
      const testFile = path.join(testDir, 'new-file.txt');
      const content = 'New content';

      const result = await fileTool.execute({
        operation: 'write',
        filePath: testFile,
        content,
      });

      expect(result.success).toBe(true);
      expect(result.path).toBe(testFile);

      const written = await fs.readFile(testFile, 'utf-8');
      expect(written).toBe(content);
    });

    it('should overwrite existing file', async () => {
      const testFile = path.join(testDir, 'existing.txt');
      await fs.writeFile(testFile, 'Old content');

      const newContent = 'New content';
      await fileTool.execute({
        operation: 'write',
        filePath: testFile,
        content: newContent,
      });

      const written = await fs.readFile(testFile, 'utf-8');
      expect(written).toBe(newContent);
    });

    it('should throw error without content', async () => {
      const testFile = path.join(testDir, 'test.txt');

      await expect(
        fileTool.execute({
          operation: 'write',
          filePath: testFile,
        })
      ).rejects.toThrow('Content required');
    });

    it('should throw error for path outside allowed paths', async () => {
      await expect(
        fileTool.execute({
          operation: 'write',
          filePath: '/tmp/outside.txt',
          content: 'test',
        })
      ).rejects.toThrow('Access denied');
    });
  });

  describe('list operation', () => {
    it('should list directory contents', async () => {
      await fs.writeFile(path.join(testDir, 'file1.txt'), 'content1');
      await fs.writeFile(path.join(testDir, 'file2.txt'), 'content2');
      await fs.mkdir(path.join(testDir, 'subdir'));

      const result = await fileTool.execute({
        operation: 'list',
        filePath: testDir,
      });

      expect(result).toContain('file1.txt');
      expect(result).toContain('file2.txt');
      expect(result).toContain('subdir');
      expect(result).toHaveLength(3);
    });

    it('should return empty array for empty directory', async () => {
      const emptyDir = path.join(testDir, 'empty');
      await fs.mkdir(emptyDir);

      const result = await fileTool.execute({
        operation: 'list',
        filePath: emptyDir,
      });

      expect(result).toEqual([]);
    });

    it('should throw error for non-existent directory', async () => {
      await expect(
        fileTool.execute({
          operation: 'list',
          filePath: path.join(testDir, 'non-existent'),
        })
      ).rejects.toThrow();
    });
  });

  describe('delete operation', () => {
    it('should delete existing file', async () => {
      const testFile = path.join(testDir, 'to-delete.txt');
      await fs.writeFile(testFile, 'content');

      const result = await fileTool.execute({
        operation: 'delete',
        filePath: testFile,
      });

      expect(result.success).toBe(true);

      await expect(fs.access(testFile)).rejects.toThrow();
    });

    it('should throw error for non-existent file', async () => {
      await expect(
        fileTool.execute({
          operation: 'delete',
          filePath: path.join(testDir, 'non-existent.txt'),
        })
      ).rejects.toThrow();
    });
  });

  describe('metadata operation', () => {
    it('should get file metadata', async () => {
      const testFile = path.join(testDir, 'metadata-test.txt');
      const content = 'Test content';
      await fs.writeFile(testFile, content);

      const result = await fileTool.execute({
        operation: 'metadata',
        filePath: testFile,
      });

      expect(result.size).toBe(content.length);
      expect(result.isFile).toBe(true);
      expect(result.isDirectory).toBe(false);
      expect(result.created).toBeInstanceOf(Date);
      expect(result.modified).toBeInstanceOf(Date);
    });

    it('should get directory metadata', async () => {
      const result = await fileTool.execute({
        operation: 'metadata',
        filePath: testDir,
      });

      expect(result.isFile).toBe(false);
      expect(result.isDirectory).toBe(true);
    });

    it('should throw error for non-existent path', async () => {
      await expect(
        fileTool.execute({
          operation: 'metadata',
          filePath: path.join(testDir, 'non-existent'),
        })
      ).rejects.toThrow();
    });
  });

  describe('security', () => {
    it('should prevent path traversal attacks', async () => {
      const maliciousPath = path.join(testDir, '../../../etc/passwd');

      await expect(
        fileTool.execute({
          operation: 'read',
          filePath: maliciousPath,
        })
      ).rejects.toThrow('Access denied');
    });

    it('should only allow operations within allowed paths', async () => {
      const restrictedTool = new FileTool([testDir]);
      const outsidePath = '/tmp/outside.txt';

      await expect(
        restrictedTool.execute({
          operation: 'read',
          filePath: outsidePath,
        })
      ).rejects.toThrow('Access denied');
    });
  });

  describe('error handling', () => {
    it('should throw error for unknown operation', async () => {
      await expect(
        fileTool.execute({
          operation: 'unknown' as any,
          filePath: testDir,
        })
      ).rejects.toThrow('Unknown operation');
    });
  });
});
