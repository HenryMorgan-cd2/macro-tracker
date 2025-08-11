-- Sample Data for Macro Tracker
-- This file truncates all tables and populates them with sample data for development

-- Truncate all tables (in correct order due to foreign key constraints)
TRUNCATE TABLE meal_template_ingredients CASCADE;
TRUNCATE TABLE meal_templates CASCADE;
TRUNCATE TABLE ingredient_templates CASCADE;
TRUNCATE TABLE meal_ingredients CASCADE;
TRUNCATE TABLE meals CASCADE;
TRUNCATE TABLE ingredients CASCADE;
TRUNCATE TABLE daily_targets CASCADE;

-- Reset sequences
ALTER SEQUENCE ingredient_templates_id_seq RESTART WITH 1;
ALTER SEQUENCE meal_templates_id_seq RESTART WITH 1;
ALTER SEQUENCE meals_id_seq RESTART WITH 1;
ALTER SEQUENCE ingredients_id_seq RESTART WITH 1;
ALTER SEQUENCE daily_targets_id_seq RESTART WITH 1;

-- Populate ingredient templates with a variety of common foods
INSERT INTO ingredient_templates (name, carbs, fat, protein, kcal, macro_unit, default_quantity, created_at, updated_at) VALUES
-- Proteins
('Chicken Breast', 0, 3.6, 31, 165, 'per_100g', 150, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Salmon', 0, 13, 20, 208, 'per_100g', 150, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Ground Beef (90% lean)', 0, 10, 26, 250, 'per_100g', 120, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Eggs', 1.1, 5.3, 6.3, 74, 'per_unit', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Greek Yogurt (0% fat)', 3.6, 0.4, 10, 59, 'per_100g', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tuna (canned in water)', 0, 0.5, 26, 116, 'per_100g', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Turkey Breast', 0, 1.2, 29, 135, 'per_100g', 120, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Cottage Cheese (1% fat)', 3.4, 1, 12, 72, 'per_100g', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Carbohydrates
('Brown Rice', 23, 0.9, 2.7, 111, 'per_100g', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Sweet Potato', 20, 0.1, 1.6, 86, 'per_100g', 150, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Oatmeal', 12, 1.8, 2.4, 68, 'per_100g', 200, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Quinoa', 22, 1.9, 4.4, 120, 'per_100g', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Whole Wheat Bread', 13, 1.1, 3.6, 69, 'per_unit', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Banana', 23, 0.3, 1.1, 89, 'per_unit', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Apple', 14, 0.2, 0.3, 52, 'per_unit', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Blueberries', 14, 0.3, 0.7, 57, 'per_100g', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Fats
('Almonds', 6, 49, 21, 579, 'per_100g', 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Peanut Butter', 8, 50, 25, 588, 'per_100g', 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Avocado', 9, 15, 2, 160, 'per_100g', 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Olive Oil', 0, 100, 0, 884, 'per_100g', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Chia Seeds', 42, 31, 17, 486, 'per_100g', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Walnuts', 4, 65, 15, 654, 'per_100g', 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Vegetables
('Broccoli', 7, 0.4, 2.8, 34, 'per_100g', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Spinach', 3.6, 0.4, 2.9, 23, 'per_100g', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Kale', 4.4, 0.5, 2.9, 35, 'per_100g', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Bell Pepper', 6, 0.2, 1, 20, 'per_100g', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Carrots', 10, 0.2, 0.9, 41, 'per_100g', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Cauliflower', 5, 0.3, 1.9, 25, 'per_100g', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Dairy
('Milk (2%)', 5, 2, 3.3, 50, 'per_100g', 240, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Cheddar Cheese', 1.3, 33, 25, 403, 'per_100g', 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Cream Cheese', 2.1, 34, 6, 342, 'per_100g', 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Populate meal templates
INSERT INTO meal_templates (name, description, created_at, updated_at) VALUES
('Protein Bowl', 'High protein meal with chicken, rice, and vegetables', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Breakfast Burrito', 'Protein-rich breakfast with eggs and whole grains', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Salmon Quinoa Bowl', 'Healthy omega-3 rich meal', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Greek Yogurt Parfait', 'Protein and fiber rich breakfast', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Turkey Sandwich', 'Lean protein sandwich with whole grain bread', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Veggie Stir Fry', 'Vegetable heavy meal with tofu', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Protein Smoothie', 'Quick protein shake with fruits', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Mediterranean Plate', 'Olive oil rich meal with fish and vegetables', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Link meal templates with ingredients
INSERT INTO meal_template_ingredients (meal_template_id, ingredient_template_id, quantity) VALUES
-- Protein Bowl
(1, 1, 150), -- Chicken Breast
(1, 9, 100), -- Brown Rice
(1, 17, 100), -- Broccoli
(1, 18, 50), -- Spinach

-- Breakfast Burrito
(2, 4, 2), -- Eggs
(2, 13, 1), -- Whole Wheat Bread
(2, 20, 1), -- Bell Pepper
(2, 19, 50), -- Spinach

-- Salmon Quinoa Bowl
(3, 2, 150), -- Salmon
(3, 12, 100), -- Quinoa
(3, 17, 100), -- Broccoli
(3, 22, 50), -- Carrots

-- Greek Yogurt Parfait
(4, 5, 150), -- Greek Yogurt
(4, 16, 50), -- Blueberries
(4, 18, 30), -- Almonds
(4, 12, 50), -- Oatmeal

-- Turkey Sandwich
(5, 7, 120), -- Turkey Breast
(5, 13, 2), -- Whole Wheat Bread
(5, 20, 50), -- Bell Pepper
(5, 19, 30), -- Spinach

-- Veggie Stir Fry
(6, 17, 150), -- Broccoli
(6, 20, 100), -- Bell Pepper
(6, 22, 100), -- Carrots
(6, 19, 100), -- Spinach

-- Protein Smoothie
(7, 5, 200), -- Greek Yogurt
(7, 15, 1), -- Banana
(7, 16, 50), -- Blueberries
(7, 18, 20), -- Almonds

-- Mediterranean Plate
(8, 2, 120), -- Salmon
(8, 17, 100), -- Broccoli
(8, 20, 100), -- Bell Pepper
(8, 23, 10), -- Olive Oil
(8, 19, 50); -- Spinach

-- Populate daily targets
INSERT INTO daily_targets (carbs_min, carbs_max, fat_min, fat_max, protein_min, protein_max, kcal_min, kcal_max, created_at, updated_at) VALUES
(150, 250, 45, 75, 120, 180, 1800, 2200, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Populate meals with sample data for the last few days
-- Today's meals
INSERT INTO meals (name, datetime) VALUES
('Protein Bowl', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('Greek Yogurt with Berries', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
('Turkey Sandwich', CURRENT_TIMESTAMP - INTERVAL '10 hours');

-- Yesterday's meals
INSERT INTO meals (name, datetime) VALUES
('Salmon Quinoa Bowl', CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '2 hours'),
('Protein Smoothie', CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '6 hours'),
('Breakfast Burrito', CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '10 hours'),
('Mediterranean Plate', CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '14 hours');

-- 2 days ago meals
INSERT INTO meals (name, datetime) VALUES
('Veggie Stir Fry', CURRENT_TIMESTAMP - INTERVAL '2 days' - INTERVAL '2 hours'),
('Protein Bowl', CURRENT_TIMESTAMP - INTERVAL '2 days' - INTERVAL '6 hours'),
('Greek Yogurt Parfait', CURRENT_TIMESTAMP - INTERVAL '2 days' - INTERVAL '10 hours'),
('Turkey Sandwich', CURRENT_TIMESTAMP - INTERVAL '2 days' - INTERVAL '14 hours');

-- 3 days ago meals
INSERT INTO meals (name, datetime) VALUES
('Salmon Quinoa Bowl', CURRENT_TIMESTAMP - INTERVAL '3 days' - INTERVAL '2 hours'),
('Protein Smoothie', CURRENT_TIMESTAMP - INTERVAL '3 days' - INTERVAL '6 hours'),
('Breakfast Burrito', CURRENT_TIMESTAMP - INTERVAL '3 days' - INTERVAL '10 hours'),
('Mediterranean Plate', CURRENT_TIMESTAMP - INTERVAL '3 days' - INTERVAL '14 hours');

-- 4 days ago meals
INSERT INTO meals (name, datetime) VALUES
('Veggie Stir Fry', CURRENT_TIMESTAMP - INTERVAL '4 days' - INTERVAL '2 hours'),
('Protein Bowl', CURRENT_TIMESTAMP - INTERVAL '4 days' - INTERVAL '6 hours'),
('Greek Yogurt Parfait', CURRENT_TIMESTAMP - INTERVAL '4 days' - INTERVAL '10 hours'),
('Turkey Sandwich', CURRENT_TIMESTAMP - INTERVAL '4 days' - INTERVAL '14 hours');

-- Now populate ingredients for each meal with realistic quantities
-- Helper function to create ingredients for meals
DO $$
DECLARE
    meal_record RECORD;
    meal_count INTEGER := 0;
BEGIN
    FOR meal_record IN SELECT id FROM meals ORDER BY id LOOP
        meal_count := meal_count + 1;
        
        -- Create different ingredient combinations for variety
        CASE (meal_count % 5)
            WHEN 0 THEN -- Protein Bowl
                INSERT INTO ingredients (name, quantity, carbs, fat, protein, kcal, macro_unit) VALUES
                ('Chicken Breast', 150, 0, 5.4, 46.5, 247.5, 'per_100g');
                INSERT INTO meal_ingredients (meal_id, ingredient_id) VALUES (meal_record.id, LASTVAL());
                
                INSERT INTO ingredients (name, quantity, carbs, fat, protein, kcal, macro_unit) VALUES
                ('Brown Rice', 100, 23, 0.9, 2.7, 111, 'per_100g');
                INSERT INTO meal_ingredients (meal_id, ingredient_id) VALUES (meal_record.id, LASTVAL());
                
                INSERT INTO ingredients (name, quantity, carbs, fat, protein, kcal, macro_unit) VALUES
                ('Broccoli', 100, 7, 0.4, 2.8, 34, 'per_100g');
                INSERT INTO meal_ingredients (meal_id, ingredient_id) VALUES (meal_record.id, LASTVAL());
                
            WHEN 1 THEN -- Greek Yogurt with Berries
                INSERT INTO ingredients (name, quantity, carbs, fat, protein, kcal, macro_unit) VALUES
                ('Greek Yogurt (0% fat)', 150, 5.4, 0.6, 15, 88.5, 'per_100g');
                INSERT INTO meal_ingredients (meal_id, ingredient_id) VALUES (meal_record.id, LASTVAL());
                
                INSERT INTO ingredients (name, quantity, carbs, fat, protein, kcal, macro_unit) VALUES
                ('Blueberries', 50, 7, 0.15, 0.35, 28.5, 'per_100g');
                INSERT INTO meal_ingredients (meal_id, ingredient_id) VALUES (meal_record.id, LASTVAL());
                
                INSERT INTO ingredients (name, quantity, carbs, fat, protein, kcal, macro_unit) VALUES
                ('Almonds', 20, 1.2, 9.8, 4.2, 115.8, 'per_100g');
                INSERT INTO meal_ingredients (meal_id, ingredient_id) VALUES (meal_record.id, LASTVAL());
                
            WHEN 2 THEN -- Turkey Sandwich
                INSERT INTO ingredients (name, quantity, carbs, fat, protein, kcal, macro_unit) VALUES
                ('Turkey Breast', 120, 0, 1.44, 34.8, 162, 'per_100g');
                INSERT INTO meal_ingredients (meal_id, ingredient_id) VALUES (meal_record.id, LASTVAL());
                
                INSERT INTO ingredients (name, quantity, carbs, fat, protein, kcal, macro_unit) VALUES
                ('Whole Wheat Bread', 2, 26, 2.2, 7.2, 138, 'per_unit');
                INSERT INTO meal_ingredients (meal_id, ingredient_id) VALUES (meal_record.id, LASTVAL());
                
                INSERT INTO ingredients (name, quantity, carbs, fat, protein, kcal, macro_unit) VALUES
                ('Bell Pepper', 50, 3, 0.1, 0.5, 10, 'per_100g');
                INSERT INTO meal_ingredients (meal_id, ingredient_id) VALUES (meal_record.id, LASTVAL());
                
            WHEN 3 THEN -- Salmon Quinoa Bowl
                INSERT INTO ingredients (name, quantity, carbs, fat, protein, kcal, macro_unit) VALUES
                ('Salmon', 150, 0, 19.5, 30, 312, 'per_100g');
                INSERT INTO meal_ingredients (meal_id, ingredient_id) VALUES (meal_record.id, LASTVAL());
                
                INSERT INTO ingredients (name, quantity, carbs, fat, protein, kcal, macro_unit) VALUES
                ('Quinoa', 100, 22, 1.9, 4.4, 120, 'per_100g');
                INSERT INTO meal_ingredients (meal_id, ingredient_id) VALUES (meal_record.id, LASTVAL());
                
                INSERT INTO ingredients (name, quantity, carbs, fat, protein, kcal, macro_unit) VALUES
                ('Broccoli', 100, 7, 0.4, 2.8, 34, 'per_100g');
                INSERT INTO meal_ingredients (meal_id, ingredient_id) VALUES (meal_record.id, LASTVAL());
                
            WHEN 4 THEN -- Protein Smoothie
                INSERT INTO ingredients (name, quantity, carbs, fat, protein, kcal, macro_unit) VALUES
                ('Greek Yogurt (0% fat)', 200, 7.2, 0.8, 20, 118, 'per_100g');
                INSERT INTO meal_ingredients (meal_id, ingredient_id) VALUES (meal_record.id, LASTVAL());
                
                INSERT INTO ingredients (name, quantity, carbs, fat, protein, kcal, macro_unit) VALUES
                ('Banana', 1, 23, 0.3, 1.1, 89, 'per_unit');
                INSERT INTO meal_ingredients (meal_id, ingredient_id) VALUES (meal_record.id, LASTVAL());
                
                INSERT INTO ingredients (name, quantity, carbs, fat, protein, kcal, macro_unit) VALUES
                ('Blueberries', 50, 7, 0.15, 0.35, 28.5, 'per_100g');
                INSERT INTO meal_ingredients (meal_id, ingredient_id) VALUES (meal_record.id, LASTVAL());
                
                INSERT INTO ingredients (name, quantity, carbs, fat, protein, kcal, macro_unit) VALUES
                ('Almonds', 20, 1.2, 9.8, 4.2, 115.8, 'per_100g');
                INSERT INTO meal_ingredients (meal_id, ingredient_id) VALUES (meal_record.id, LASTVAL());
        END CASE;
    END LOOP;
END $$;

-- Display summary of created data
SELECT 'Sample Data Created Successfully!' as status;

SELECT 'Ingredient Templates:' as info, COUNT(*) as count FROM ingredient_templates
UNION ALL
SELECT 'Meal Templates:', COUNT(*) FROM meal_templates
UNION ALL
SELECT 'Meals:', COUNT(*) FROM meals
UNION ALL
SELECT 'Ingredients:', COUNT(*) FROM ingredients
UNION ALL
SELECT 'Daily Targets:', COUNT(*) FROM daily_targets;
