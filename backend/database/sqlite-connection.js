import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create SQLite database for development
const dbPath = join(__dirname, 'onestopcentre.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('📊 Connected to SQLite database for development');

export const query = (text, params = []) => {
  try {
    // Convert PostgreSQL parameterized queries ($1, $2) to SQLite (?1, ?2)
    const sqliteQuery = text.replace(/\$(\d+)/g, '?$1');
    
    if (sqliteQuery.toLowerCase().trim().startsWith('select') || 
        sqliteQuery.toLowerCase().trim().startsWith('with')) {
      const stmt = db.prepare(sqliteQuery);
      const rows = stmt.all(params);
      return { rows };
    } else {
      const stmt = db.prepare(sqliteQuery);
      const result = stmt.run(params);
      return { 
        rows: result.changes > 0 ? [{ 
          id: result.lastInsertRowid,
          ...result 
        }] : [],
        rowCount: result.changes
      };
    }
  } catch (error) {
    console.error('SQLite query error:', error);
    throw error;
  }
};

export const getClient = () => {
  return {
    query: (text, params) => query(text, params),
    release: () => {} // No-op for SQLite
  };
};

export default db;