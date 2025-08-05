-- OneStopCentre Uganda Database Schema - SQLite Version
-- Professional database structure for government services platform

-- Users table for authentication and user management
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    is_verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Business registrations table
CREATE TABLE IF NOT EXISTS business_registrations (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    registration_number TEXT UNIQUE,
    tin_number TEXT,
    address TEXT,
    district TEXT,
    sector TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Investment opportunities table
CREATE TABLE IF NOT EXISTS investments (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    title TEXT NOT NULL,
    description TEXT,
    sector TEXT NOT NULL,
    location TEXT,
    investment_amount DECIMAL(15,2),
    roi_percentage DECIMAL(5,2),
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    created_by TEXT REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Government services table
CREATE TABLE IF NOT EXISTS government_services (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    department TEXT,
    requirements TEXT, -- JSON string for SQLite
    processing_time TEXT,
    fee DECIMAL(10,2),
    online_available INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Service applications table
CREATE TABLE IF NOT EXISTS service_applications (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    service_id TEXT REFERENCES government_services(id),
    application_data TEXT, -- JSON string for SQLite
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'completed')),
    reference_number TEXT UNIQUE,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to TEXT REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Activity logs for audit trail
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    details TEXT, -- JSON string for SQLite
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_business_registrations_user_id ON business_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_business_registrations_status ON business_registrations(status);
CREATE INDEX IF NOT EXISTS idx_investments_sector ON investments(sector);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_service_applications_user_id ON service_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_service_applications_status ON service_applications(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Insert some sample data for development
INSERT OR IGNORE INTO government_services (name, description, category, department, processing_time, fee, online_available) VALUES
('Business Registration', 'Register a new business entity in Uganda', 'Business', 'URSB', '5-7 business days', 50000, 1),
('Tax Registration', 'Register for tax obligations with URA', 'Tax', 'URA', '3-5 business days', 0, 1),
('Work Permit Application', 'Apply for work permit for foreign nationals', 'Immigration', 'MOIA', '14-21 business days', 300000, 0),
('Trading License', 'Obtain trading license for commercial activities', 'Licensing', 'Local Government', '7-10 business days', 100000, 1);

INSERT OR IGNORE INTO investments (title, description, sector, location, investment_amount, roi_percentage, risk_level, status) VALUES
('Kampala Shopping Mall', 'Modern shopping complex in Kampala city center', 'Real Estate', 'Kampala', 5000000, 15.5, 'medium', 'active'),
('Organic Coffee Plantation', 'Sustainable coffee farming in Mount Elgon region', 'Agriculture', 'Mbale', 2000000, 18.2, 'low', 'active'),
('Solar Energy Project', 'Large-scale solar power generation facility', 'Energy', 'Soroti', 10000000, 22.0, 'medium', 'active'),
('Fish Processing Plant', 'Modern fish processing and packaging facility', 'Manufacturing', 'Jinja', 3500000, 16.8, 'medium', 'active');