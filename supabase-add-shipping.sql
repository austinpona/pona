-- Run this in Supabase SQL Editor to add shipping address columns to orders

ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_name     TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_email    TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_street   TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city     TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_province TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_postal   TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_country  TEXT DEFAULT 'South Africa';

-- Allow anon to insert orders (for the server-side service key this isn't needed,
-- but just in case)
CREATE POLICY IF NOT EXISTS "Service can manage orders"
  ON orders FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service can manage order_items"
  ON order_items FOR ALL USING (true) WITH CHECK (true);
