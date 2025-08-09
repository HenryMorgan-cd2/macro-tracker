-- Migration script to add quantity column to ingredients table
-- Run this if you have an existing database without the quantity column

-- Add quantity column with default value 1
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS quantity DECIMAL(8,2) NOT NULL DEFAULT 1;

-- Update existing ingredients to have quantity = 1 if they don't have it
UPDATE ingredients SET quantity = 1 WHERE quantity IS NULL;
