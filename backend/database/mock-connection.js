import dotenv from 'dotenv';

dotenv.config();

// Mock database for development when PostgreSQL is not available
console.log('📊 Using mock database for development (no PostgreSQL required)');

// In-memory data store
const mockData = {
  users: [
    {
      id: '1',
      email: 'admin@onestopcentre.ug',
      password_hash: '$2a$12$mockhashedpasswordforadmin',
      first_name: 'Admin',
      last_name: 'User',
      phone: '+256700000000',
      role: 'admin',
      is_verified: true,
      created_at: new Date().toISOString()
    }
  ],
  business_registrations: [],
  investments: [
    {
      id: '1',
      title: 'Kampala Shopping Mall',
      description: 'Modern shopping complex in Kampala city center',
      sector: 'Real Estate',
      location: 'Kampala',
      investment_amount: 5000000,
      roi_percentage: 15.5,
      risk_level: 'medium',
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Organic Coffee Plantation',
      description: 'Sustainable coffee farming in Mount Elgon region',
      sector: 'Agriculture',
      location: 'Mbale',
      investment_amount: 2000000,
      roi_percentage: 18.2,
      risk_level: 'low',
      status: 'active',
      created_at: new Date().toISOString()
    }
  ],
  government_services: [
    {
      id: '1',
      name: 'Business Registration',
      description: 'Register a new business entity in Uganda',
      category: 'Business',
      department: 'URSB',
      processing_time: '5-7 business days',
      fee: 50000,
      online_available: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Tax Registration',
      description: 'Register for tax obligations with URA',
      category: 'Tax',
      department: 'URA',
      processing_time: '3-5 business days',
      fee: 0,
      online_available: true,
      created_at: new Date().toISOString()
    }
  ],
  support_tickets: [],
  service_applications: [],
  activity_logs: []
};

// Generate simple ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock query function
export const query = async (text, params = []) => {
  const sql = text.toLowerCase().trim();
  
  try {
    // Handle SELECT queries
    if (sql.startsWith('select')) {
      if (sql.includes('from users')) {
        if (sql.includes('where email =')) {
          const email = params[0];
          const user = mockData.users.find(u => u.email === email);
          return { rows: user ? [user] : [] };
        }
        if (sql.includes('where id =')) {
          const id = params[0];
          const user = mockData.users.find(u => u.id === id);
          return { rows: user ? [user] : [] };
        }
        return { rows: mockData.users };
      }
      
      if (sql.includes('from investments')) {
        if (sql.includes('where id =')) {
          const id = params[0];
          const investment = mockData.investments.find(i => i.id === id);
          return { rows: investment ? [investment] : [] };
        }
        return { rows: mockData.investments };
      }
      
      if (sql.includes('from government_services')) {
        if (sql.includes('where id =')) {
          const id = params[0];
          const service = mockData.government_services.find(s => s.id === id);
          return { rows: service ? [service] : [] };
        }
        return { rows: mockData.government_services };
      }
      
      if (sql.includes('from business_registrations')) {
        return { rows: mockData.business_registrations };
      }
      
      if (sql.includes('from support_tickets')) {
        return { rows: mockData.support_tickets };
      }
    }
    
    // Handle INSERT queries
    if (sql.startsWith('insert')) {
      const id = generateId();
      const now = new Date().toISOString();
      
      if (sql.includes('into users')) {
        const newUser = {
          id,
          email: params[0],
          password_hash: params[1],
          first_name: params[2],
          last_name: params[3],
          phone: params[4] || null,
          role: params[5] || 'user',
          is_verified: false,
          created_at: now
        };
        mockData.users.push(newUser);
        return { rows: [newUser] };
      }
      
      if (sql.includes('into business_registrations')) {
        const newRegistration = {
          id,
          user_id: params[0],
          business_name: params[1],
          business_type: params[2],
          address: params[3],
          district: params[4],
          sector: params[5],
          status: 'pending',
          created_at: now
        };
        mockData.business_registrations.push(newRegistration);
        return { rows: [newRegistration] };
      }
      
      if (sql.includes('into support_tickets')) {
        const newTicket = {
          id,
          user_id: params[0] || null,
          subject: params[1],
          message: params[2],
          category: params[3] || null,
          priority: params[4] || 'medium',
          status: 'open',
          created_at: now
        };
        mockData.support_tickets.push(newTicket);
        return { rows: [newTicket] };
      }
    }
    
    // Handle UPDATE queries
    if (sql.startsWith('update')) {
      return { rows: [], rowCount: 1 };
    }
    
    // Handle CREATE TABLE and other DDL
    if (sql.startsWith('create') || sql.startsWith('alter') || sql.startsWith('drop')) {
      return { rows: [] };
    }
    
    console.log('Mock query not handled:', sql);
    return { rows: [] };
    
  } catch (error) {
    console.error('Mock query error:', error);
    throw error;
  }
};

export const getClient = async () => {
  return {
    query,
    release: () => {}
  };
};

export default { query, getClient };