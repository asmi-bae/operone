
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
  private undoStack: DirectoryNode[] = [];
  private redoStack: DirectoryNode[] = [];
  private MAX_HISTORY = 50;

  constructor() {
    this.root = this.createDirectoryNode('');
  }

  // --- Snapshotting & History ---

  private cloneDirectoryUtil(node: DirectoryNode): DirectoryNode {
    const newDir = this.createDirectoryNode(node.name);
    newDir.metadata = { ...node.metadata };
    
    for (const [name, child] of node.children) {
      if (child.type === 'file') {
        const newFile: FileNode = {
          type: 'file',
          name: child.name,
          content: child.content,
          metadata: { ...child.metadata }
        };
        newDir.children.set(name, newFile);
      } else {
        newDir.children.set(name, this.cloneDirectoryUtil(child));
      }
    }
    return newDir;
  }

  private saveState() {
    // Deep clone the current root and push to undoStack
    const snapshot = this.cloneDirectoryUtil(this.root);
    this.undoStack.push(snapshot);
    if (this.undoStack.length > this.MAX_HISTORY) {
        this.undoStack.shift();
    }
    // Clear redo stack on new action
    this.redoStack = [];
  }

  undo(): boolean {
    if (this.undoStack.length === 0) return false;
    
    // Save current state to redo
    const currentSnapshot = this.cloneDirectoryUtil(this.root);
    this.redoStack.push(currentSnapshot);
    
    // Restore last state
    const previousState = this.undoStack.pop();
    if (previousState) {
        this.root = previousState;
        return true;
    }
    return false;
  }

  redo(): boolean {
    if (this.redoStack.length === 0) return false;

    // Save current state to undo
    const currentSnapshot = this.cloneDirectoryUtil(this.root);
    this.undoStack.push(currentSnapshot);

    // Restore next state
    const nextState = this.redoStack.pop();
    if (nextState) {
        this.root = nextState;
        return true;
    }
    return false;
  }

  // --- Helpers ---

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
    // Check validity before saving state
    const result = this.getParentDir(path);
    if (!result) throw new Error(`Cannot write to ${path}: Invalid path`);
    const { parent, name } = result;
    const existing = parent.children.get(name);
    if (existing && existing.type === 'directory') {
      throw new Error(`Cannot write to ${path}: Is a directory`);
    }

    this.saveState();

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
    
    this.saveState();
    
    parent.children.delete(name);
    parent.metadata.modifiedAt = Date.now();
    return true;
  }

  // Directory Operations

  mkdir(path: string): boolean {
    const result = this.getParentDir(path);
    if (!result) return false;

    const { parent, name } = result;
    if (parent.children.has(name)) return false; 

    this.saveState();

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
    
    if (!recursive && node.children.size > 0) return false;

    this.saveState();

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

    const destNode = this.resolveNode(dest);
    let targetParent: DirectoryNode;
    let targetName: string;

    if (destNode && destNode.type === 'directory') {
        targetParent = destNode;
        targetName = srcNode.name;
    } else {
        const destParentInfo = this.getParentDir(dest);
        if (!destParentInfo) return false;
        targetParent = destParentInfo.parent;
        targetName = destParentInfo.name;
    }
    
    if (targetParent.children.has(targetName)) return false;

    this.saveState();

    srcParentInfo.parent.children.delete(srcParentInfo.name);
    srcNode.name = targetName;
    targetParent.children.set(targetName, srcNode);
    
    srcParentInfo.parent.metadata.modifiedAt = Date.now();
    targetParent.metadata.modifiedAt = Date.now();
    
    return true;
  }

  copy(src: string, dest: string): boolean {
      // dry run check
      if (!this.exists(src)) return false;
      
      this.saveState();
      
      return this.copyRecursive(src, dest);
  }

  private copyRecursive(src: string, dest: string): boolean {
    const srcNode = this.resolveNode(src);
    if (!srcNode) return false;

    if (srcNode.type === 'file') {
        // Internal write, direct manipulation to avoid creating extra history
        const result = this.getParentDir(dest);
        if (!result) return false; 
        const { parent, name } = result;
        const file = this.createFileNode(name, srcNode.content);
        parent.children.set(name, file);
        return true;
    } else {
        // Directory copy
        if (!this.exists(dest)) {
             // Create directory manually to avoid triggering saveState
             const result = this.getParentDir(dest);
             if (!result) return false; 
             const { parent, name } = result;
             const dir = this.createDirectoryNode(name);
             parent.children.set(name, dir);
        }

        let success = true;
        for (const name of srcNode.children.keys()) {
             const childDest = dest === '/' ? `/${name}` : `${dest}/${name}`;
             const childSrc = src === '/' ? `/${name}` : `${src}/${name}`;
             if (!this.copyRecursive(childSrc, childDest)) success = false;
        }
        return success;
    }
  }

  stat(path: string): FSNode | null {
    return this.resolveNode(path);
  }

  resolvePath(cwd: string, path: string): string {
    if (path.startsWith('/')) {
        return this.normalizePath(path);
    }
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
