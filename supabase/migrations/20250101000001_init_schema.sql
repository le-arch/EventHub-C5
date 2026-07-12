CREATE TYPE IF NOT EXISTS user_role AS ENUM ('organizer', 'admin');
CREATE TYPE IF NOT EXISTS event_status AS ENUM ('draft', 'published', 'cancelled', 'suspended', 'archived');
CREATE TYPE IF NOT EXISTS payment_status AS ENUM ('pending', 'paid', 'failed', 'cancelled', 'refunded');

-- Users (organizers + admin)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'organizer',
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT now() ,
    updated_at TIMESTAMP DEFAULT now() 
);

-- 2. EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    venue TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME NOT NULL,
    end_time TIME,
    cover_image_url TEXT,
    status event_status NOT NULL DEFAULT 'draft',
    sales_start_date DATE,
    sales_end_date DATE,
    capacity_range int4range,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TICKET TYPES TABLE
CREATE TABLE IF NOT EXISTS ticket_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price INT NOT NULL,
    quantity_available INT NOT NULL,
    quantity_sold INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id),
    ticket_type_id UUID NOT NULL REFERENCES ticket_types(id),
    attendee_name VARCHAR(255) NOT NULL, 
    attendee_phone VARCHAR(20) NOT NULL,
    attendee_email VARCHAR(255), 
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    unit_price INT NOT NULL,
    total_amount INT NOT NULL,
    payment_status payment_status NOT NULL DEFAULT 'pending', 
    payment_method VARCHAR(20) DEFAULT 'mtn_momo'
        CHECK (payment_method IN ('mtn_momo', 'orange_money', 'credit card')), 
    transaction_id VARCHAR(255) UNIQUE,
    payment_received_at TIMESTAMP,
    payment_webhook_received BOOLEAN DEFAULT FALSE,
    qr_code_hash VARCHAR(255) UNIQUE NOT NULL,
    qr_code_image_url TEXT DEFAULT '',
    qr_code_plaintext TEXT NOT NULL DEFAULT '',
    manual_code VARCHAR(20) UNIQUE NOT NULL DEFAULT '',
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    used_at TIMESTAMP,
    checked_in_by UUID REFERENCES users(id),
    platform_fee INT NOT NULL DEFAULT 0,
    device_info TEXT,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. WEBHOOK LOGS
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway VARCHAR(50) NOT NULL,
    payload JSONB,
    headers JSONB,
    signature_valid BOOLEAN,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP,
    error_message TEXT,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. ADMIN ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(255),
    target_type VARCHAR(50),
    target_id UUID,
    old_values JSONB,
    new_values JSONB,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. SYSTEM CONFIGURATION
CREATE TABLE IF NOT EXISTS system_config (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCTION INDEXES (IF NOT EXISTS handled by CREATE INDEX)
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_ticket_types_event ON ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_event ON orders(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_attendee_name ON orders(attendee_name);
CREATE INDEX IF NOT EXISTS idx_orders_is_used ON orders(is_used);
