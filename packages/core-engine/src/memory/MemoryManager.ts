// Conditional import for better-sqlite3 (Node.js only)
let Database: any;
try {
  Database = require('better-sqlite3');
} catch (error) {
  // better-sqlite3 not available (browser environment)
  console.warn('better-sqlite3 not available, using browser memory manager');
}

import { Memory } from '@repo/types';

export interface MemoryEntry {
  id: number;
  content: string;
  timestamp: number;
  metadata?: string;
}

export class MemoryManager implements Memory {
  private db: any;
  public shortTerm: string[] = [];
  private readonly maxShortTermSize = 10;

  constructor(dbPath: string = './operone-memory.db') {
    if (!Database) {
      throw new Error('MemoryManager requires better-sqlite3, which is not available in browser environment. Use BrowserMemoryManager instead.');
    }
    
    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS long_term_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        metadata TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_timestamp ON long_term_memory(timestamp);
    `);
  }

  public longTerm = {
    query: async (text: string): Promise<string[]> => {
      const stmt = this.db.prepare(`
        SELECT content FROM long_term_memory 
        WHERE content LIKE ? 
        ORDER BY timestamp DESC 
        LIMIT 10
      `);
      
      const results = stmt.all(`%${text}%`) as MemoryEntry[];
      return results.map(r => r.content);
    },

    store: async (text: string): Promise<void> => {
      const stmt = this.db.prepare(`
        INSERT INTO long_term_memory (content, timestamp) 
        VALUES (?, ?)
      `);
      
      stmt.run(text, Date.now());
    }
  };

  public addToShortTerm(content: string): void {
    this.shortTerm.push(content);
    if (this.shortTerm.length > this.maxShortTermSize) {
      this.shortTerm.shift();
    }
  }

  public clearShortTerm(): void {
    this.shortTerm = [];
  }

  public close(): void {
    this.db.close();
  }
}
