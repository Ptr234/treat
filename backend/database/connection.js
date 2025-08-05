import dotenv from 'dotenv';

dotenv.config();

// Secure database connection with proper fallback handling
async function createDatabaseConnection() {
  // Debug environment variables
  console.log('🔍 Environment Debug:');
  console.log('  NODE_ENV:', process.env.NODE_ENV);
  console.log('  USE_MOCK_DB:', process.env.USE_MOCK_DB);
  console.log('  DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('  DATABASE_URL preview:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'undefined');
  
  const USE_MOCK = process.env.USE_MOCK_DB === 'true' || process.env.NODE_ENV === 'development';
  
  console.log('🔧 Database decision: USE_MOCK =', USE_MOCK);
  
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
      const result = await pool.query('SELECT 1 as test');
      console.log('✅ PostgreSQL database connection verified successfully');
      console.log('📊 Test query result:', result.rows[0]);
    } catch (testError) {
      console.error('❌ PostgreSQL connection test failed with detailed error:');
      console.error('  Error code:', testError.code);
      console.error('  Error message:', testError.message);
      console.error('  Connection details:', {
        host: testError.hostname || 'unknown',
        port: testError.port || 'unknown',
        database: testError.database || 'unknown'
      });
      
      // In production, we require PostgreSQL - don't fall back to mock
      if (process.env.NODE_ENV === 'production') {
        console.error('🚨 Production requires PostgreSQL - refusing to start with mock database');
        throw new Error(`PostgreSQL connection failed: ${testError.message}`);
      }
      
      console.warn('⚠️ Development mode: falling back to mock database');
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