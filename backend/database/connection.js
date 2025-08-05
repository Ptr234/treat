import dotenv from 'dotenv';

dotenv.config();

// Secure database connection with proper fallback handling
async function createDatabaseConnection() {
  const USE_MOCK = process.env.USE_MOCK_DB === 'true' || process.env.NODE_ENV === 'development';
  
  if (USE_MOCK) {
    try {
      console.log('🔧 Initializing mock database for development');
      const mockDb = await import('./mock-connection.js');
      return mockDb.default;
    } catch (error) {
      console.error('❌ Failed to load mock database:', error);
      throw new Error('Database initialization failed');
    }
  }

  // Production PostgreSQL connection
  try {
    if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
      throw new Error('Database configuration missing. Set DATABASE_URL or DB_HOST.');
    }

    const pg = await import('pg');
    const { Pool } = pg.default;

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'onestopcentre_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    // Test connection immediately
    try {
      await pool.query('SELECT 1');
      console.log('📊 PostgreSQL database connection verified');
    } catch (testError) {
      console.warn('⚠️ PostgreSQL connection test failed, falling back to mock database');
      const mockDb = await import('./mock-connection.js');
      return mockDb.default;
    }

    // Setup connection event handlers
    pool.on('connect', () => {
      console.log('📊 New PostgreSQL client connected');
    });

    pool.on('error', (err) => {
      console.error('❌ PostgreSQL pool error:', err);
      // Don't exit process, just log the error
    });

    return {
      query: async (text, params) => {
        try {
          return await pool.query(text, params);
        } catch (error) {
          console.error('Query error:', error);
          throw error;
        }
      },
      getClient: async () => {
        try {
          return await pool.connect();
        } catch (error) {
          console.error('Client connection error:', error);
          throw error;
        }
      },
      end: () => pool.end()
    };

  } catch (error) {
    console.warn('⚠️ PostgreSQL setup failed, using mock database:', error.message);
    try {
      const mockDb = await import('./mock-connection.js');
      return mockDb.default;
    } catch (mockError) {
      console.error('❌ Critical: Both PostgreSQL and mock database failed');
      throw new Error('Database system unavailable');
    }
  }
}

// Initialize connection
const dbConnection = await createDatabaseConnection();

export const query = dbConnection.query;
export const getClient = dbConnection.getClient;
export default dbConnection;