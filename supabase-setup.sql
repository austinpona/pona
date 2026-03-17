-- ============================================================
-- Infinity Pearls — Supabase Setup
-- Run this entire file in your Supabase SQL Editor
-- (https://supabase.com/dashboard → SQL Editor → New query)
-- ============================================================


-- ── 1. Products ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT          NOT NULL,
  description TEXT          DEFAULT '',
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url   TEXT          DEFAULT '',
  badge       TEXT          DEFAULT NULL,  -- 'new' | 'bestseller' | null
  active      BOOLEAN       DEFAULT true,
  created_at  TIMESTAMPTZ   DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active products"
  ON products FOR SELECT USING (active = true);


-- ── 2. Customers ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT,
  email      TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;


-- ── 3. Orders ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                BIGSERIAL PRIMARY KEY,
  customer_id       BIGINT REFERENCES customers(id),
  status            TEXT          DEFAULT 'pending',
  total_amount      NUMERIC(10,2) DEFAULT 0,
  stripe_session_id TEXT,
  created_at        TIMESTAMPTZ   DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;


-- ── 4. Order items ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id           BIGSERIAL PRIMARY KEY,
  order_id     BIGINT REFERENCES orders(id),
  product_name TEXT,
  quantity     INTEGER       DEFAULT 1,
  unit_price   NUMERIC(10,2) DEFAULT 0,
  created_at   TIMESTAMPTZ   DEFAULT NOW()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;


-- ── 5. Contact submissions ────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_submissions (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;


-- ── 6. Business totals view (for admin dashboard) ─────────────
CREATE OR REPLACE VIEW business_totals AS
SELECT
  COALESCE(SUM(total_amount), 0)         AS total_sales,
  COUNT(*)                                AS total_orders,
  (SELECT COUNT(*) FROM customers)        AS total_customers
FROM orders
WHERE status = 'paid';

-- Allow anon to read the view (used by frontend admin panel)
GRANT SELECT ON business_totals TO anon;


-- ── 7. Insert products ────────────────────────────────────────
INSERT INTO products (name, description, price, image_url, badge) VALUES
  ('Aqua & Pearl Spider Charm',   'Elegant bracelet with turquoise beads, clear crystals, and a unique spider charm', 60, 'images/IMG-20260122-WA0007.jpg', 'new'),
  ('Red & Pearl 8-Ball Bracelet', 'Bold red beads with white pearls featuring an 8-ball charm and star accent',       60, 'images/IMG-20260122-WA0008.jpg', 'new'),
  ('Coral & Mint Bat Charm',      'Unique color-blocked design with coral, orange, and mint beads with bat charm',    60, 'images/IMG-20260122-WA0010.jpg', 'new'),
  ('Rainbow Flower Power',        'Vibrant rainbow gradient bracelet with cheerful flower charm',                     60, 'images/IMG-20260122-WA0011.jpg', 'bestseller'),
  ('Pink & Black Heart Star',     'Chic pink and black beads with heart and star charm accents',                     60, 'images/IMG-20260122-WA0012.jpg', 'bestseller'),
  ('Purple Cross & Star',         'Deep purple beads with decorative cross and star charms',                          60, 'images/IMG-20260122-WA0013.jpg', 'bestseller'),
  ('Infinity Link Bracelet',      'Elegant silver bracelet with repeating infinity symbol links',                     60, 'images/IMG-20260122-WA0007.jpg', null),
  ('Pink Ombre Set',              'Delicate pink gradient bracelets - perfect matching pair',                         60, 'images/IMG-20260122-WA0008.jpg', null),
  ('Crystal Daisy Bracelet',      'Sparkling clear crystal beads with white daisy charm',                             60, 'images/IMG-20260122-WA0010.jpg', null),
  ('Pink Crystal Bear Charm',     'Sweet pink crystal beads with adorable bear face charm',                           60, 'images/IMG-20260122-WA0011.jpg', null)
ON CONFLICT DO NOTHING;


-- ── 8. Add auth_user_id to customers (for Supabase Auth link) ─
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);


-- ── 9. Saved addresses ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_addresses (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT,
  street       TEXT,
  city         TEXT,
  province     TEXT,
  postal_code  TEXT,
  country      TEXT DEFAULT 'South Africa',
  is_default   BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE saved_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own addresses"
  ON saved_addresses FOR ALL USING (auth.uid() = user_id);

-- Allow authenticated users to read their own orders
CREATE POLICY "Users read own orders"
  ON orders FOR SELECT USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );


-- ── 10. Customers RLS (so logged-in users can read/link their record) ─
DROP POLICY IF EXISTS "Users read own customer"   ON customers;
DROP POLICY IF EXISTS "Users insert own customer" ON customers;
DROP POLICY IF EXISTS "Users update own customer" ON customers;

-- Read: user matches by auth_user_id OR by their verified email (before linking)
CREATE POLICY "Users read own customer" ON customers FOR SELECT
  USING (
    auth_user_id = auth.uid()
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Insert: any authenticated user can create their own customer record
CREATE POLICY "Users insert own customer" ON customers FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Update: user can update if auth_user_id matches OR email matches their account
CREATE POLICY "Users update own customer" ON customers FOR UPDATE
  USING (
    auth_user_id = auth.uid()
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
