-- Add original_price column to products table
-- Run this in Supabase SQL Editor
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price NUMERIC(10,2) DEFAULT NULL;

-- Set the original price for the Gothic Skull bracelet (was R65, now R45)
UPDATE products SET original_price = 65 WHERE id = 39;
