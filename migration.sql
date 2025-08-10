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

-- Migration to add ingredient_templates table
-- This migration creates a table for storing ingredient templates in the database

-- Create ingredient_templates table
CREATE TABLE IF NOT EXISTS ingredient_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    carbs DECIMAL(8,2) NOT NULL DEFAULT 0,
    fat DECIMAL(8,2) NOT NULL DEFAULT 0,
    protein DECIMAL(8,2) NOT NULL DEFAULT 0,
    kcal DECIMAL(8,2) NOT NULL DEFAULT 0,
    macro_unit VARCHAR(20) NOT NULL DEFAULT 'per_unit',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add check constraint for macro_unit in ingredient_templates
ALTER TABLE ingredient_templates ADD CONSTRAINT check_ingredient_templates_macro_unit CHECK (macro_unit IN ('per_unit', 'per_100g'));

-- Insert some default ingredient templates
INSERT INTO ingredient_templates (name, carbs, fat, protein, kcal, macro_unit) VALUES
    ('Chicken Breast', 0, 3.6, 31, 165, 'per_100g'),
    ('Brown Rice', 23, 0.9, 2.7, 111, 'per_100g'),
    ('Broccoli', 7, 0.4, 2.8, 34, 'per_100g'),
    ('Salmon', 0, 13, 20, 208, 'per_100g'),
    ('Sweet Potato', 20, 0.1, 1.6, 86, 'per_100g'),
    ('Eggs', 1.1, 5.3, 6.3, 74, 'per_unit'),
    ('Greek Yogurt', 3.6, 0.4, 10, 59, 'per_100g'),
    ('Oatmeal', 12, 1.8, 2.4, 68, 'per_100g'),
    ('Banana', 23, 0.3, 1.1, 89, 'per_unit'),
    ('Almonds', 6, 49, 21, 579, 'per_100g')
ON CONFLICT (name) DO NOTHING;
