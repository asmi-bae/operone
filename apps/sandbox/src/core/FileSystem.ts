
export interface FileNode {
  type: 'file';
  name: string;
  content: string;
  metadata: {
    createdAt: number;
    modifiedAt: number;
    size: number;
  };
}

export interface DirectoryNode {
  type: 'directory';
  name: string;
  children: Map<string, FileNode | DirectoryNode>;
  metadata: {
    createdAt: number;
    modifiedAt: number;
  };
}

export type FSNode = FileNode | DirectoryNode;

export class FileSystem {
  private root: DirectoryNode;

  constructor() {
    this.root = this.createDirectoryNode('');
  }

  private createDirectoryNode(name: string): DirectoryNode {
    return {
      type: 'directory',
      name,
      children: new Map(),
      metadata: {
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      },
    };
  }

  private createFileNode(name: string, content: string): FileNode {
    return {
      type: 'file',
      name,
      content,
      metadata: {
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        size: content.length,
      },
    };
  }

  private getPathSegments(path: string): string[] {
    return path.split('/').filter(Boolean);
  }

  private resolveNode(path: string): FSNode | null {
    if (path === '/' || path === '') return this.root;
    
    const segments = this.getPathSegments(path);
    let current: FSNode = this.root;

    for (const segment of segments) {
      if (current.type !== 'directory') return null;
      const next = current.children.get(segment);
      if (!next) return null;
      current = next;
    }

    return current;
  }

  private getParentDir(path: string): { parent: DirectoryNode; name: string } | null {
    const segments = this.getPathSegments(path);
    if (segments.length === 0) return null; // Root has no parent

    const fileName = segments[segments.length - 1];
    const parentPath = segments.slice(0, -1).join('/');
    
    const parent = this.resolveNode(parentPath);
    if (!parent || parent.type !== 'directory') return null;

    return { parent, name: fileName };
  }

  // File Operations

  writeFile(path: string, content: string): void {
    const result = this.getParentDir(path);
    if (!result) throw new Error(`Cannot write to ${path}: Invalid path`);
    
    const { parent, name } = result;
    const existing = parent.children.get(name);

    if (existing && existing.type === 'directory') {
      throw new Error(`Cannot write to ${path}: Is a directory`);
    }

    const file = this.createFileNode(name, content);
    parent.children.set(name, file);
    parent.metadata.modifiedAt = Date.now();
  }

  readFile(path: string): string | null {
    const node = this.resolveNode(path);
    if (!node || node.type !== 'file') return null;
    return node.content;
  }

  exists(path: string): boolean {
    return this.resolveNode(path) !== null;
  }

  deleteFile(path: string): boolean {
    const result = this.getParentDir(path);
    if (!result) return false;

    const { parent, name } = result;
    const node = parent.children.get(name);
    
    if (!node || node.type !== 'file') return false;
    
    parent.children.delete(name);
    parent.metadata.modifiedAt = Date.now();
    return true;
  }

  // Directory Operations

  mkdir(path: string): boolean {
    const result = this.getParentDir(path);
    if (!result) return false; // Could happen if parent doesn't exist

    const { parent, name } = result;
    if (parent.children.has(name)) return false; // Already exists

    const dir = this.createDirectoryNode(name);
    parent.children.set(name, dir);
    parent.metadata.modifiedAt = Date.now();
    return true;
  }

  rmdir(path: string, recursive: boolean = false): boolean {
    const result = this.getParentDir(path);
    if (!result) return false;

    const { parent, name } = result;
    const node = parent.children.get(name);

    if (!node || node.type !== 'directory') return false;
    
    if (!recursive && node.children.size > 0) return false; // Must be empty if not recursive

    parent.children.delete(name);
    parent.metadata.modifiedAt = Date.now();
    return true;
  }

  ls(path: string): string[] {
    const node = this.resolveNode(path);
    if (!node || node.type !== 'directory') return [];
    
    return Array.from(node.children.keys());
  }

  // Advanced Operations

  move(src: string, dest: string): boolean {
    const srcNode = this.resolveNode(src);
    if (!srcNode) return false;

    const srcParentInfo = this.getParentDir(src);
    if (!srcParentInfo) return false;

    // Check dest
    // If dest is directory, move into it
    const destNode = this.resolveNode(dest);
    let targetParent: DirectoryNode;
    let targetName: string;

    if (destNode && destNode.type === 'directory') {
        targetParent = destNode;
        targetName = srcNode.name; // Keep same name
    } else {
        // Assume dest is the full new path
        const destParentInfo = this.getParentDir(dest);
        if (!destParentInfo) return false; // Parent of dest must exist
        targetParent = destParentInfo.parent;
        targetName = destParentInfo.name;
    }
    
    // Check if target already exists
    if (targetParent.children.has(targetName)) return false;

    // Perform move
    srcParentInfo.parent.children.delete(srcParentInfo.name);
    srcNode.name = targetName;
    targetParent.children.set(targetName, srcNode);
    
    srcParentInfo.parent.metadata.modifiedAt = Date.now();
    targetParent.metadata.modifiedAt = Date.now();
    
    return true;
  }

  copy(src: string, dest: string): boolean {
    const srcNode = this.resolveNode(src);
    if (!srcNode) return false;

    if (srcNode.type === 'file') {
        this.writeFile(dest, srcNode.content);
        return true;
    } else {
        // Recursive copy for directories
        // First create dest dir
        if (!this.exists(dest)) {
            if (!this.mkdir(dest)) return false; /* Failed to create dest dir */
        }
        
        let success = true;
        for (const name of srcNode.children.keys()) {
             const childDest = dest === '/' ? `/${name}` : `${dest}/${name}`;
             const childSrc = src === '/' ? `/${name}` : `${src}/${name}`;
             if (!this.copy(childSrc, childDest)) success = false;
        }
        return success;
    }
  }

  stat(path: string): FSNode | null {
    return this.resolveNode(path);
  }

  resolvePath(cwd: string, path: string): string {
    if (path.startsWith('/')) {
        // Absolute path, just normalize
        return this.normalizePath(path);
    }
    // Relative path
    const combined = cwd === '/' ? `/${path}` : `${cwd}/${path}`;
    return this.normalizePath(combined);
  }

  private normalizePath(path: string): string {
    const parts = path.split('/').filter(Boolean);
    const stack: string[] = [];
    
    for (const part of parts) {
        if (part === '.') continue;
        if (part === '..') {
            stack.pop();
        } else {
            stack.push(part);
        }
    }
    
    return '/' + stack.join('/');
  }
}
