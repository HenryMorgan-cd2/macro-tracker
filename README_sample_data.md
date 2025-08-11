# Sample Data for Macro Tracker

This directory contains SQL files to populate your Macro Tracker database with sample data for development and testing purposes.

## Files

- `sample_data.sql` - Complete sample data setup (truncates all tables and populates with comprehensive data)

## How to Use

### Option 1: Using psql command line

```bash
# Connect to your database and run the sample data script
psql -h localhost -U postgres -d macro_tracker -f sample_data.sql
```

### Option 2: Using a database GUI tool

1. Open your preferred database GUI tool (pgAdmin, DBeaver, etc.)
2. Connect to your macro_tracker database
3. Open and execute the `sample_data.sql` file

### Option 3: Copy and paste

1. Open the SQL file in a text editor
2. Copy the contents
3. Paste into your database query tool and execute

## What the Sample Data Includes

### Ingredient Templates (30 items)
- **Proteins**: Chicken Breast, Salmon, Ground Beef, Eggs, Greek Yogurt, Tuna, Turkey Breast, Cottage Cheese
- **Carbohydrates**: Brown Rice, Sweet Potato, Oatmeal, Quinoa, Whole Wheat Bread, Banana, Apple, Blueberries
- **Fats**: Almonds, Peanut Butter, Avocado, Olive Oil, Chia Seeds, Walnuts
- **Vegetables**: Broccoli, Spinach, Kale, Bell Pepper, Carrots, Cauliflower
- **Dairy**: Milk, Cheddar Cheese, Cream Cheese

### Meal Templates (8 templates)
1. **Protein Bowl** - High protein meal with chicken, rice, and vegetables
2. **Breakfast Burrito** - Protein-rich breakfast with eggs and whole grains
3. **Salmon Quinoa Bowl** - Healthy omega-3 rich meal
4. **Greek Yogurt Parfait** - Protein and fiber rich breakfast
5. **Turkey Sandwich** - Lean protein sandwich with whole grain bread
6. **Veggie Stir Fry** - Vegetable heavy meal
7. **Protein Smoothie** - Quick protein shake with fruits
8. **Mediterranean Plate** - Olive oil rich meal with fish and vegetables

### Sample Meals (20 meals)
- **Today**: 3 meals (Protein Bowl, Greek Yogurt with Berries, Turkey Sandwich)
- **Yesterday**: 4 meals (Salmon Quinoa Bowl, Protein Smoothie, Breakfast Burrito, Mediterranean Plate)
- **2 days ago**: 4 meals
- **3 days ago**: 4 meals
- **4 days ago**: 4 meals

### Daily Targets
- **Protein**: 120-180g (min-max)
- **Carbs**: 150-250g (min-max)
- **Fat**: 45-75g (min-max)
- **Calories**: 1800-2200 kcal (min-max)

## Data Characteristics

- **Realistic Macros**: All ingredient macros are based on real nutritional data
- **Varied Meals**: Different meal types throughout the week for testing
- **Proper Quantities**: Realistic serving sizes and quantities
- **Mixed Units**: Both per_100g and per_unit macro units for variety
- **Recent Dates**: Meals are spread across the last 5 days for realistic testing

## After Running

Once you've executed the sample data script, you'll have:

1. A fully populated database with realistic data
2. Daily targets set up to test the progress tracking
3. Multiple days of meals to test the daily totals and progress bars
4. Ingredient and meal templates to test the template functionality

## Resetting the Data

If you want to start fresh, simply run the script again. It will:
1. Truncate all existing data
2. Reset all auto-increment sequences
3. Populate with fresh sample data

## Notes

- The script uses `CURRENT_TIMESTAMP` for dates, so meals will appear relative to when you run the script
- All foreign key relationships are properly maintained
- The data is designed to show realistic daily totals that will interact well with the daily targets
- Progress bars and status indicators will work immediately with this sample data

## Troubleshooting

If you encounter any issues:

1. **Permission errors**: Make sure your database user has TRUNCATE and INSERT permissions
2. **Foreign key errors**: The script handles dependencies correctly, but ensure all tables exist first
3. **Sequence errors**: The script resets sequences, but if you have custom sequences, you may need to adjust them

## Customization

Feel free to modify the sample data to better suit your development needs:
- Add more ingredients
- Modify macro values
- Change meal compositions
- Adjust daily targets
- Add more meal templates
