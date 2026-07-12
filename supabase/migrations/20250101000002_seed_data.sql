-- Seed data for development and testing
-- Password for all users: password123

-- Users
INSERT INTO users (id, email, phone, password_hash, full_name, role, is_email_verified, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'john@example.com', '670000001', '$2b$10$SNNb57vIrINLco1DdRrQ2e78GswRnMbZLtzlhpzk1GhWUl/RhhYhO', 'John Doe', 'organizer', TRUE, TRUE),
  ('22222222-2222-2222-2222-222222222222', 'jane@example.com', '670000002', '$2b$10$SNNb57vIrINLco1DdRrQ2e78GswRnMbZLtzlhpzk1GhWUl/RhhYhO', 'Jane Smith', 'admin', TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- System config
INSERT INTO system_config (key, value, description)
VALUES
  ('platform_name', 'EventHub', 'Name of the event management platform'),
  ('platform_fee_percentage', '5', 'Platform fee as percentage of ticket price'),
  ('support_email', 'support@eventhub.cm', 'Customer support email address')
ON CONFLICT (key) DO NOTHING;

-- Events
INSERT INTO events (id, organizer_id, title, slug, description, venue, city, start_date, end_date, start_time, end_time, status, sales_start_date, sales_end_date, capacity_range)
VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Cameroon Tech Summit 2026',
    'cameroon-tech-summit-2026',
    'The biggest tech conference in Central Africa featuring keynote speakers, workshops, and networking opportunities for tech enthusiasts, entrepreneurs, and investors.',
    'Yaoundé Conference Center',
    'Yaoundé',
    '2026-08-15',
    '2026-08-17',
    '09:00',
    '18:00',
    'published',
    '2026-06-01',
    '2026-08-14',
    '[100,500]'
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Douala Music Festival',
    'douala-music-festival-2026',
    'A vibrant celebration of Cameroonian music featuring live performances from top artists across genres like Makossa, Bikutsi, and Afrobeat.',
    'Douala Stadium',
    'Douala',
    '2026-09-20',
    '2026-09-22',
    '14:00',
    '23:59',
    'published',
    '2026-07-01',
    '2026-09-19',
    '[500,2000]'
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'Yaoundé Business Conference',
    'yaounde-business-conference-2026',
    'Connect with entrepreneurs, investors, and business leaders shaping the future of Cameroon economy.',
    'Hilton Hotel Yaoundé',
    'Yaoundé',
    '2026-10-10',
    NULL,
    '08:00',
    '17:00',
    'draft',
    NULL,
    NULL,
    '[50,200]'
  )
ON CONFLICT (id) DO NOTHING;

-- Ticket Types
INSERT INTO ticket_types (id, event_id, name, description, price, quantity_available, quantity_sold, is_active)
VALUES
  -- Cameroon Tech Summit
  ('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Early Bird', 'Early bird ticket with full access to all sessions', 5000, 100, 1, TRUE),
  ('b1111111-1111-1111-1111-111111111112', 'a1111111-1111-1111-1111-111111111111', 'VIP', 'VIP access with reserved seating, lunch, and networking dinner', 15000, 50, 1, TRUE),
  -- Douala Music Festival
  ('b2222222-2222-2222-2222-222222222221', 'a2222222-2222-2222-2222-222222222222', 'Standard', 'General admission to all festival days', 3000, 200, 1, TRUE),
  ('b2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'Premium', 'Premium access with VIP zone and complimentary drinks', 8000, 100, 0, TRUE),
  -- Yaoundé Business Conference
  ('b3333333-3333-3333-3333-333333333331', 'a3333333-3333-3333-3333-333333333333', 'General', 'General admission', 2000, 150, 0, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Orders (paid and checked-in attendees)
INSERT INTO orders (id, event_id, ticket_type_id, attendee_name, attendee_phone, attendee_email, quantity, unit_price, total_amount, payment_status, payment_method, transaction_id, payment_received_at, payment_webhook_received, qr_code_hash, qr_code_image_url, qr_code_plaintext, manual_code, is_used, used_at, checked_in_by, platform_fee)
VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'Alice Kamga',
    '670000003',
    'alice@example.com',
    1, 5000, 5000,
    'paid', 'mtn_momo', 'TXN-ALICE-001',
    CURRENT_TIMESTAMP - INTERVAL '2 days', TRUE,
    'hash-alice-kamga', '', 'alice-kamga-qr', 'A7K2-M9P1',
    TRUE, CURRENT_TIMESTAMP - INTERVAL '1 day', '11111111-1111-1111-1111-111111111111', 250
  ),
  (
    'c1111111-1111-1111-1111-111111111112',
    'a1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'Bob Nkwi',
    '670000004',
    'bob@example.com',
    1, 5000, 5000,
    'paid', 'mtn_momo', 'TXN-BOB-001',
    CURRENT_TIMESTAMP - INTERVAL '1 day', TRUE,
    'hash-bob-nkwi', '', 'bob-nkwi-qr', 'B0B3-NKW1',
    TRUE, CURRENT_TIMESTAMP, '11111111-1111-1111-1111-111111111111', 250
  ),
  (
    'c1111111-1111-1111-1111-111111111113',
    'a1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111112',
    'Clara Tchinda',
    '670000005',
    'clara@example.com',
    1, 15000, 15000,
    'paid', 'orange_money', 'TXN-CLARA-001',
    CURRENT_TIMESTAMP - INTERVAL '3 days', TRUE,
    'hash-clara-tchinda', '', 'clara-tchinda-qr', 'C7K2-M9P3',
    TRUE, CURRENT_TIMESTAMP - INTERVAL '12 hours', '11111111-1111-1111-1111-111111111111', 750
  ),
  (
    'c2222222-2222-2222-2222-222222222221',
    'a2222222-2222-2222-2222-222222222222',
    'b2222222-2222-2222-2222-222222222221',
    'David Mbah',
    '670000006',
    'david@example.com',
    2, 3000, 6000,
    'paid', 'mtn_momo', 'TXN-DAVID-001',
    CURRENT_TIMESTAMP - INTERVAL '1 day', TRUE,
    'hash-david-mbah', '', 'david-mbah-qr', 'D4V1-MBH1',
    TRUE, CURRENT_TIMESTAMP, '11111111-1111-1111-1111-111111111111', 300
  )
ON CONFLICT (id) DO NOTHING;

-- Admin log: seed data imported
INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'seed_data_imported', 'system', NULL, '{"description": "Initial seed data imported for development"}')
ON CONFLICT (id) DO NOTHING;
