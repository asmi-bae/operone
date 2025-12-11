import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileSystem } from './FileSystem';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';

describe('FileSystem', () => {
  let fileSystem: FileSystem;
  let tempDir: string;

  beforeEach(async () => {
    fileSystem = new FileSystem();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fs-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('should write and read a file', async () => {
    const filePath = path.join(tempDir, 'test.txt');
    const content = 'Hello, World!';
    
    await fileSystem.writeFile(filePath, content);
    
    expect(await fileSystem.exists(filePath)).toBe(true);
    expect(await fileSystem.readFile(filePath)).toBe(content);
  });

  it('should append to a file', async () => {
    const filePath = path.join(tempDir, 'append.txt');
    await fileSystem.writeFile(filePath, 'Hello');
    await fileSystem.appendFile(filePath, ' World');
    
    expect(await fileSystem.readFile(filePath)).toBe('Hello World');
  });

  it('should delete a file', async () => {
    const filePath = path.join(tempDir, 'delete.txt');
    await fileSystem.writeFile(filePath, 'delete me');
    
    await fileSystem.deleteFile(filePath);
    expect(await fileSystem.exists(filePath)).toBe(false);
  });

  it('should create and delete a directory', async () => {
    const dirPath = path.join(tempDir, 'new-dir');
    
    await fileSystem.createDirectory(dirPath);
    expect(await fileSystem.exists(dirPath)).toBe(true);
    
    await fileSystem.deleteDirectory(dirPath);
    expect(await fileSystem.exists(dirPath)).toBe(false);
  });

  it('should list directory contents', async () => {
    const dirPath = path.join(tempDir, 'list-dir');
    await fileSystem.createDirectory(dirPath);
    
    await fileSystem.writeFile(path.join(dirPath, 'file1.txt'), '1');
    await fileSystem.writeFile(path.join(dirPath, 'file2.txt'), '2');
    
    const files = await fileSystem.listDirectory(dirPath);
    expect(files).toContain('file1.txt');
    expect(files).toContain('file2.txt');
    expect(files.length).toBe(2);
  });

  it('should copy a file', async () => {
    const src = path.join(tempDir, 'src.txt');
    const dest = path.join(tempDir, 'dest.txt');
    
    await fileSystem.writeFile(src, 'copy me');
    await fileSystem.copy(src, dest);
    
    expect(await fileSystem.readFile(dest)).toBe('copy me');
  });

  it('should move a file', async () => {
    const src = path.join(tempDir, 'move-src.txt');
    const dest = path.join(tempDir, 'move-dest.txt');
    
    await fileSystem.writeFile(src, 'move me');
    await fileSystem.move(src, dest);
    
    expect(await fileSystem.exists(src)).toBe(false);
    expect(await fileSystem.readFile(dest)).toBe('move me');
  });

  it('should get file stats', async () => {
    const filePath = path.join(tempDir, 'stats.txt');
    const content = 'stats';
    await fileSystem.writeFile(filePath, content);
    
    const stats = await fileSystem.getStats(filePath);
    expect(stats.isFile()).toBe(true);
    expect(stats.size).toBe(content.length);
  });
});
