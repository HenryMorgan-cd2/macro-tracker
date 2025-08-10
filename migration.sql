-- Migration to add macro_unit column to ingredients table
-- This migration adds support for per unit vs per 100g macro values

-- Add the macro_unit column with a default value
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS macro_unit VARCHAR(20) NOT NULL DEFAULT 'per_unit';

-- Update existing records to have the default value
UPDATE ingredients SET macro_unit = 'per_unit' WHERE macro_unit IS NULL;

-- Add a check constraint to ensure valid values
-- Note: We'll drop the constraint first if it exists to avoid errors
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'check_macro_unit') THEN
        ALTER TABLE ingredients DROP CONSTRAINT check_macro_unit;
    END IF;
END $$;

ALTER TABLE ingredients ADD CONSTRAINT check_macro_unit CHECK (macro_unit IN ('per_unit', 'per_100g'));
