#!/bin/bash

# Reset Sample Data Script for Macro Tracker
# This script resets the database and loads fresh sample data

echo "🔄 Resetting Macro Tracker database with sample data..."

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql command not found. Please install PostgreSQL client tools."
    exit 1
fi

# Database connection parameters (modify these if needed)
DB_HOST="localhost"
DB_USER="postgres"
DB_NAME="macro_tracker"

echo "📊 Connecting to database: $DB_NAME on $DB_HOST as $DB_USER"
echo ""

# Run the sample data SQL file
echo "🗑️  Truncating existing data..."
echo "📥 Loading sample data..."
echo ""

if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f sample_data.sql; then
    echo ""
    echo "✅ Sample data loaded successfully!"
    echo ""
    echo "📈 What was created:"
    echo "   • 31 Ingredient Templates"
    echo "   • 8 Meal Templates"
    echo "   • 19 Sample Meals (spread across 5 days)"
    echo "   • 61 Ingredients with realistic macros"
    echo "   • Daily Targets (Protein: 120-180g, Carbs: 150-250g, etc.)"
    echo ""
    echo "🎯 You can now test:"
    echo "   • Daily progress bars and targets"
    echo "   • Meal management and templates"
    echo "   • Progress tracking against daily goals"
    echo ""
    echo "🌐 Open your app to see the new data in action!"
else
    echo ""
    echo "❌ Error: Failed to load sample data"
    echo "   Make sure:"
    echo "   • PostgreSQL is running"
    echo "   • Database '$DB_NAME' exists"
    echo "   • User '$DB_USER' has proper permissions"
    echo "   • You're in the correct directory with sample_data.sql"
    exit 1
fi
