CREATE TYPE user_role AS ENUM ('organizer', 'admin');
-- Users (organizers + admin)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'organizer',
    is_email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- event schema migration



--tickets schema migration


-- orders schema migration


--checkin logschema migration


--webhook log schema migration


--admin log schema migration


--create system log schema migration