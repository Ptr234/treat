import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrateSQLite() {
  try {
    console.log('🔄 Starting SQLite database migration...');
    
    const dbPath = join(__dirname, 'onestopcentre.db');
    const db = new Database(dbPath);
    
    const schemaPath = join(__dirname, 'sqlite-schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        db.exec(statement);
      }
    }
    
    db.close();
    
    console.log('✅ SQLite database migration completed successfully');
    console.log(`📊 Database created at: ${dbPath}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ SQLite migration failed:', error);
    process.exit(1);
  }
}

migrateSQLite();