-- Add phone number columns to customers and orders
-- Run this in the Supabase SQL editor

-- Add phone to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add shipping_phone to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_phone TEXT DEFAULT '';
