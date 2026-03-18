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
  ('Infinity Link Bracelet',          'Elegant silver bracelet with repeating infinity symbol links',                         65, 'images/IMG-20260318-WA0058.jpg', 'bestseller'),
  ('Silver Star Necklace',            'Delicate silver chain necklace with a dainty star pendant',                            35, 'images/IMG-20260318-WA0059.jpg', 'new'),
  ('Silver Cross Necklace',           'Minimalist silver chain with an elegant open cross pendant',                           65, 'images/IMG-20260318-WA0060.jpg', 'new'),
  ('Letter & Star Charm Necklace',    'Silver chain necklace with initial letter pendant and star charms',                    65, 'images/IMG-20260318-WA0061.jpg', 'new'),
  ('Custom Name Bracelets',           'Personalised pearl bracelets with letter beads, flower and butterfly charms',           60, 'images/IMG-20260318-WA0062.jpg', 'bestseller'),
  ('Blue Crystal Cross Bracelet Set', 'Stunning blue and clear crystal bead bracelet pair with cross and angel charms',       50, 'images/IMG-20260318-WA0063.jpg', null),
  ('Pink Crystal Bear Bracelet',      'Sweet pink crystal beads with adorable bear face charm and dangle accent',             65, 'images/IMG-20260318-WA0064.jpg', 'bestseller'),
  ('Crystal Daisy Bracelet',          'Sparkling clear crystal beads with a beautiful white daisy flower charm',              45, 'images/IMG-20260318-WA0065.jpg', null),
  ('Pink & Black Hello Kitty Bracelet','Pink and black beads with crystal spacers and Hello Kitty star charm',                45, 'images/IMG-20260318-WA0066.jpg', null),
  ('Gothic Cross Link Bracelet',      'Bold silver gothic cross link bracelet with vintage charm',                            45, 'images/IMG-20260318-WA0067.jpg', null),
  ('Leopard Charm Bangle',            'Silver cable bangle with leopard print beads, 8-ball, cherry and cheetah charms',      50, 'images/IMG-20260223-WA0008.jpg', 'new')
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
