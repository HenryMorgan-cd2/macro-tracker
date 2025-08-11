# Default Quantities Implementation for Template Ingredients

## Overview
This implementation adds support for default quantities when using ingredient templates in meal templates. Previously, all template ingredients defaulted to quantity 1, but now users can specify custom default quantities for each ingredient in a meal template.

## Changes Made

### 1. Backend Changes (Go)

#### Updated Data Structures
- **IngredientTemplate struct**: Added `Quantity float64` field to store default quantities
- **Database**: The `meal_template_ingredients` table already had a `quantity` field, so no schema changes were needed

#### Updated Functions
- **getMealTemplates()**: Now retrieves and includes quantity information for each ingredient
- **getMealTemplate()**: Now retrieves and includes quantity information for a single template
- **createMealTemplate()**: Now uses the quantity from the ingredient template instead of hardcoding to 1.0
- **updateMealTemplate()**: Now uses the quantity from the ingredient template instead of hardcoding to 1.0

### 2. Frontend Changes (TypeScript/React)

#### Updated Types
- **IngredientTemplate interface**: Added optional `quantity?: number` field

#### Updated Components
- **MealTemplateManager**: 
  - Added quantity input fields for each selected ingredient
  - Updated macro calculations to account for quantities
  - Enhanced ingredient selection UI with quantity inputs
  - Updated template editing to handle quantities

- **MealForm**: 
  - Updated `addMealFromTemplate()` to use template quantities instead of hardcoded 1

## How It Works

### 1. Creating Meal Templates
When creating a meal template, users can now:
- Select ingredients from the ingredient template library
- Specify a default quantity for each ingredient (e.g., 2 eggs, 150g chicken breast)
- See real-time macro calculations based on the specified quantities

### 2. Using Meal Templates
When using a meal template to create a meal:
- The ingredients are added with their default quantities from the template
- Users can still adjust quantities as needed for the specific meal
- Macro calculations automatically account for the template quantities

### 3. Example Usage
```
Meal Template: "Protein Bowl"
- Chicken Breast: 150g (default quantity)
- Brown Rice: 100g (default quantity)  
- Broccoli: 75g (default quantity)

When using this template:
- Chicken Breast: 150g (from template)
- Brown Rice: 100g (from template)
- Broccoli: 75g (from template)

Total macros are calculated based on these quantities.
```

## Benefits

1. **More Realistic Templates**: Meal templates now reflect realistic portion sizes
2. **Better Macro Calculations**: Template macros are calculated based on actual quantities
3. **Improved User Experience**: Users don't need to manually adjust quantities every time they use a template
4. **Flexibility**: Users can still override quantities when creating individual meals

## Technical Implementation

### Database Schema
The existing `meal_template_ingredients` table already supported quantities:
```sql
CREATE TABLE meal_template_ingredients (
    meal_template_id INTEGER REFERENCES meal_templates(id) ON DELETE CASCADE,
    ingredient_template_id INTEGER REFERENCES ingredient_templates(id) ON DELETE CASCADE,
    quantity DECIMAL(8,2) NOT NULL DEFAULT 1,
    PRIMARY KEY (meal_template_id, ingredient_template_id)
);
```

### API Endpoints
No new endpoints were needed. Existing endpoints now return and accept quantity information:
- `GET /api/meal-templates` - Returns templates with ingredient quantities
- `POST /api/meal-templates` - Accepts ingredient quantities
- `PUT /api/meal-templates/:id` - Accepts ingredient quantities

### Frontend State Management
The MealTemplateManager component now tracks ingredient quantities as part of the template editing state, ensuring that quantities are preserved when saving templates.

## Testing

To test the implementation:

1. **Start the backend**: `go run main.go`
2. **Start the frontend**: `npm run dev`
3. **Create a meal template** with custom quantities
4. **Use the template** to create a meal and verify quantities are applied
5. **Edit the template** and verify quantities are preserved

## Future Enhancements

Potential improvements that could be added:
1. **Unit selection**: Allow users to specify units (g, oz, pieces) for quantities
2. **Quantity validation**: Add validation for reasonable quantity ranges
3. **Bulk quantity editing**: Allow editing quantities for multiple ingredients at once
4. **Quantity presets**: Common quantity presets (e.g., "small", "medium", "large" portions)
