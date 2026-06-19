CREATE TYPE user_role AS ENUM ('organizer', 'admin');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'suspended', 'archived');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'cancelled', 'refunded');

-- Enable required UUID generation extensions
CREATE EXTENSION "uuid-ossp";

-- Users (organizers + admin)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'organizer',
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_otp VARCHAR(6),
    email_otp_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now() ,
    updated_at TIMESTAMP DEFAULT now() 
    
);


-- 2. EVENTS TABLE
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    venue_name VARCHAR(255) NOT NULL,      -- frontend expects venueName
    venue_address TEXT, 
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

-- Auto-generate slug from title (optional)
CREATE OR REPLACE FUNCTION generate_event_slug()
RETURNS TRIGGER AS $$
BEGIN
    NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_event_slug
    BEFORE INSERT ON events
    FOR EACH ROW
    EXECUTE FUNCTION generate_event_slug();

-- 3. TICKET TYPES TABLE
CREATE TABLE ticket_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price INT NOT NULL CHECK (price >= 0),
    quantity_available INT NOT NULL CHECK (quantity_available >= 0),
    quantity_sold INT DEFAULT 0 CHECK (quantity_sold <= quantity_available),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- 4. ORDERS TABLE (Developer C's Core Task Feature)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id),
    ticket_type_id UUID NOT NULL REFERENCES ticket_types(id),
    
    -- Mandatory attendee requirements
    attendee_name VARCHAR(255) NOT NULL, 
    attendee_phone VARCHAR(20) NOT NULL,
    attendee_email VARCHAR(255), 
    
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    unit_price INT NOT NULL,
    total_amount INT NOT NULL,
    
    payment_status VARCHAR(20) DEFAULT 'pending',   -- pending, paid, failed, refunded
    payment_method VARCHAR(20) DEFAULT 'campay',    -- campay (primary)
    transaction_id VARCHAR(255) UNIQUE,
    payment_received_at TIMESTAMP,
    payment_webhook_received BOOLEAN DEFAULT FALSE,
    
    qr_code_hash VARCHAR(255) UNIQUE NOT NULL,
    qr_code_image_url TEXT DEFAULT '',
    qr_code_plaintext TEXT NOT NULL DEFAULT '',
    
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    checked_in_by UUID REFERENCES users(id),
    platform_fee INT NOT NULL DEFAULT 0,
    
    device_info TEXT,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. WEBHOOK LOGS (For tracing payment notifications)

CREATE TABLE payment_webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(255),
    order_id UUID,
    provider VARCHAR(50) DEFAULT 'campay',
    payload JSONB,
    headers JSONB,
    signature_valid BOOLEAN,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP,
    error_message TEXT,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. ADMIN ACTIVITY LOGS
CREATE TABLE admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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


-- 7. CHECK-IN LOGS (frontend expects this table)

CREATE TABLE check_in_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id),
    attendee_name VARCHAR(255) NOT NULL,
    event_id UUID NOT NULL REFERENCES events(id),
    scanned_by UUID NOT NULL REFERENCES users(id),
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);


-- 8. SYSTEM CONFIGURATION (CamPay & frontend origin)

CREATE TABLE system_config (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO system_config (key, value, description) VALUES
    ('campay_enabled', 'true', 'Enable CamPay payments'),
    ('campay_api_url', 'https://campay.net/api/v1', 'CamPay API endpoint'),
    ('frontend_origin', 'http://localhost:3000', 'Allowed frontend origin for CORS'),
    ('qr_secret_key', gen_random_uuid()::text, 'HMAC secret for QR codes'),
    ('maintenance_mode', 'false', 'Enable maintenance mode');


-- INDEXES for performance (frontend queries)

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_slug ON events(slug);

CREATE INDEX idx_ticket_types_event ON ticket_types(event_id);
CREATE INDEX idx_ticket_types_price ON ticket_types(price);

CREATE INDEX idx_orders_event ON orders(event_id);
CREATE INDEX idx_orders_attendee_name ON orders(attendee_name);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_qr_hash ON orders(qr_code_hash);
CREATE INDEX idx_orders_is_used ON orders(is_used);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_event_status ON orders(event_id, payment_status);

CREATE INDEX idx_check_in_logs_order ON check_in_logs(order_id);
CREATE INDEX idx_check_in_logs_scanned_at ON check_in_logs(scanned_at);
CREATE INDEX idx_check_in_logs_attendee_name ON check_in_logs(attendee_name);

CREATE INDEX idx_webhook_transaction ON payment_webhook_logs(transaction_id);
CREATE INDEX idx_webhook_processed ON payment_webhook_logs(processed);

CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_target ON admin_logs(target_type, target_id);


-- TRIGGERS for updated_at columns

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ticket_types_updated_at BEFORE UPDATE ON ticket_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- CONSTRAINT for ticket quantity sold (trigger already handles)

CREATE OR REPLACE FUNCTION check_ticket_availability()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantity_sold > NEW.quantity_available THEN
        RAISE EXCEPTION 'quantity_sold cannot exceed quantity_available';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_ticket_availability
    BEFORE UPDATE ON ticket_types
    FOR EACH ROW
    EXECUTE FUNCTION check_ticket_availability();

