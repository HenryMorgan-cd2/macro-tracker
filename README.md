# Macro Tracker

A web application for tracking macronutrients in meals with support for flexible macro units.

## Features

- Track meals with ingredients and their macronutrients
- Support for two macro unit types:
  - **Per Unit**: Macros are entered as-is (e.g., 1 apple = 25g carbs)
  - **Per 100g**: Macros are per 100g and automatically scaled based on quantity (e.g., pasta at 70g carbs per 100g, eating 50g = 35g carbs)
- Ingredient templates for quick meal creation
- Automatic macro calculations based on quantity and unit type

## Development

### Backend
```bash
go run main.go
```

### Frontend
```bash
npm run vite
```

### Database Migration

After setting up the database, run the migration to add the macro_unit column:

```bash
psql -d macro_tracker -f migration.sql
```

## Usage

1. **Creating Ingredients**: When adding ingredients to a meal, select whether the macros are "Per Unit" or "Per 100g"
2. **Per Unit**: Enter the macros as they appear on the package for the quantity you're eating
3. **Per 100g**: Enter the macros per 100g (as shown on most food packages), then enter your actual quantity - the app will automatically calculate the correct macros
4. **Templates**: Save commonly used ingredients as templates with their macro unit type for quick reuse

## Example

- **Pasta (Per 100g)**: Enter carbs: 70g, fat: 1g, protein: 12g per 100g
- **Quantity**: 50g
- **Result**: App automatically calculates carbs: 35g, fat: 0.5g, protein: 6g
