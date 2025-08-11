package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

type Ingredient struct {
	ID         int     `json:"id,omitempty"`
	Name       string  `json:"name"`
	Quantity   float64 `json:"quantity"`
	Carbs      float64 `json:"carbs"`
	Fat        float64 `json:"fat"`
	Protein    float64 `json:"protein"`
	Kcal       float64 `json:"kcal"`
	MacroUnit  string  `json:"macroUnit"`
}

type IngredientTemplate struct {
	ID         int     `json:"id,omitempty"`
	Name       string  `json:"name"`
	Carbs      float64 `json:"carbs"`
	Fat        float64 `json:"fat"`
	Protein    float64 `json:"protein"`
	Kcal       float64 `json:"kcal"`
	MacroUnit  string  `json:"macroUnit"`
	Quantity   float64 `json:"quantity,omitempty"` // Default quantity when used in meal templates
	CreatedAt  string  `json:"createdAt,omitempty"`
	UpdatedAt  string  `json:"updatedAt,omitempty"`
}

type Meal struct {
	ID          int           `json:"id,omitempty"`
	Name        string        `json:"name"`
	DateTime    string        `json:"datetime"`
	Ingredients []Ingredient  `json:"ingredients"`
}

type MealIngredient struct {
	MealID       int `json:"meal_id"`
	IngredientID int `json:"ingredient_id"`
}

type MealTemplate struct {
	ID          int           `json:"id,omitempty"`
	Name        string        `json:"name"`
	Description string        `json:"description,omitempty"`
	Ingredients []IngredientTemplate `json:"ingredients"`
	CreatedAt   string        `json:"createdAt,omitempty"`
	UpdatedAt   string        `json:"updatedAt,omitempty"`
}

type MealTemplateIngredient struct {
	MealTemplateID int `json:"meal_template_id"`
	IngredientTemplateID int `json:"ingredient_template_id"`
	Quantity float64 `json:"quantity"`
}

var db *sql.DB

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Database connection
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		connStr = "postgres://postgres:password@localhost:5432/macro_tracker?sslmode=disable"
	}
	log.Print("Connecting to database with connection string:", connStr)

	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Test database connection
	if err = db.Ping(); err != nil {
		log.Fatal(err)
	}

	// Initialize database tables
	if err = initDB(); err != nil {
		log.Fatal(fmt.Errorf("failed to initialize database: %w", err))
	}

	// Setup Gin router
	r := gin.Default()

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(config))

	// Serve static files from the dist directory
	r.Static("/assets", "./dist/assets")
	r.StaticFile("/favicon.ico", "./dist/favicon.ico")
	
	// SPA routing - serve index.html for all non-API routes
	r.NoRoute(func(c *gin.Context) {
		// Check if the request is for an API route
		if c.Request.URL.Path == "/" || c.Request.URL.Path == "/index.html" {
			c.File("./dist/index.html")
			return
		}
		
		// For all other non-API routes, serve index.html for SPA routing
		c.File("./dist/index.html")
	})

	// API routes
	api := r.Group("/api")
	{
		api.GET("/meals", getMeals)
		api.GET("/meals/:id", getMeal)
		api.POST("/meals", createMeal)
		api.PUT("/meals/:id", updateMeal)
		api.DELETE("/meals/:id", deleteMeal)
		api.GET("/ingredients", getIngredients)
		api.POST("/ingredients", createIngredient)
		api.GET("/ingredient-templates", getIngredientTemplates)
		api.POST("/ingredient-templates", createIngredientTemplate)
		api.PUT("/ingredient-templates/:id", updateIngredientTemplate)
		api.DELETE("/ingredient-templates/:id", deleteIngredientTemplate)
		api.GET("/meal-templates", getMealTemplates)
		api.GET("/meal-templates/:id", getMealTemplate)
		api.POST("/meal-templates", createMealTemplate)
		api.PUT("/meal-templates/:id", updateMealTemplate)
		api.DELETE("/meal-templates/:id", deleteMealTemplate)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}

func initDB() error {
	// Create meals table
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS meals (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			datetime TIMESTAMP NOT NULL
		)
	`)
	if err != nil {
		return err
	}

	// Create ingredients table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS ingredients (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			quantity DECIMAL(8,2) NOT NULL DEFAULT 1,
			carbs DECIMAL(8,2) NOT NULL DEFAULT 0,
			fat DECIMAL(8,2) NOT NULL DEFAULT 0,
			protein DECIMAL(8,2) NOT NULL DEFAULT 0,
			kcal DECIMAL(8,2) NOT NULL DEFAULT 0,
			macro_unit VARCHAR(20) NOT NULL DEFAULT 'per_unit'
		)
	`)
	if err != nil {
		return err
	}

	// Create meal_ingredients junction table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS meal_ingredients (
			meal_id INTEGER REFERENCES meals(id) ON DELETE CASCADE,
			ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
			PRIMARY KEY (meal_id, ingredient_id)
		)
	`)
	if err != nil {
		return err
	}

	// Create ingredient_templates table
	_, err = db.Exec(`
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
		)
	`)
	if err != nil {
		return err
	}

	// Create meal_templates table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS meal_templates (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			description TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return err
	}

	// Create meal_template_ingredients junction table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS meal_template_ingredients (
			meal_template_id INTEGER REFERENCES meal_templates(id) ON DELETE CASCADE,
			ingredient_template_id INTEGER REFERENCES ingredient_templates(id) ON DELETE CASCADE,
			quantity DECIMAL(8,2) NOT NULL DEFAULT 1,
			PRIMARY KEY (meal_template_id, ingredient_template_id)
		)
	`)
	if err != nil {
		return err
	}

	// Add check constraint for macro_unit in ingredient_templates
	_, err = db.Exec(`
		DO $$
		BEGIN
			IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'check_ingredient_templates_macro_unit') THEN
				ALTER TABLE ingredient_templates ADD CONSTRAINT check_ingredient_templates_macro_unit CHECK (macro_unit IN ('per_unit', 'per_100g'));
			END IF;
		END $$;
	`)
	if err != nil {
		return err
	}

	// Insert default ingredient templates if table is empty
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM ingredient_templates").Scan(&count)
	if err != nil {
		return err
	}

	if count == 0 {
		_, err = db.Exec(`
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
		`)
		if err != nil {
			return err
		}
	}

	return nil
}

func getMeals(c *gin.Context) {
	rows, err := db.Query(`
		SELECT m.id, m.name, m.datetime, 
		       i.id, i.name, i.quantity, i.carbs, i.fat, i.protein, i.kcal, i.macro_unit
		FROM meals m
		LEFT JOIN meal_ingredients mi ON m.id = mi.meal_id
		LEFT JOIN ingredients i ON mi.ingredient_id = i.id
		ORDER BY m.datetime DESC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	mealsMap := make(map[int]*Meal)
	for rows.Next() {
		var mealID int
		var mealName, mealDateTime string
		var ingredientID sql.NullInt64
		var ingredientName sql.NullString
		var quantity, carbs, fat, protein, kcal sql.NullFloat64
		var macroUnit sql.NullString

		err := rows.Scan(&mealID, &mealName, &mealDateTime, &ingredientID, &ingredientName, &quantity, &carbs, &fat, &protein, &kcal, &macroUnit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		meal, exists := mealsMap[mealID]
		if !exists {
			meal = &Meal{
				ID:          mealID,
				Name:        mealName,
				DateTime:    mealDateTime,
				Ingredients: []Ingredient{},
			}
			mealsMap[mealID] = meal
		}

		if ingredientID.Valid {
			ingredient := Ingredient{
				ID:        int(ingredientID.Int64),
				Name:      ingredientName.String,
				Quantity:  quantity.Float64,
				Carbs:     carbs.Float64,
				Fat:       fat.Float64,
				Protein:   protein.Float64,
				Kcal:      kcal.Float64,
				MacroUnit: macroUnit.String,
			}
			meal.Ingredients = append(meal.Ingredients, ingredient)
		}
	}

	meals := make([]Meal, 0, len(mealsMap))
	for _, meal := range mealsMap {
		meals = append(meals, *meal)
	}

	c.JSON(http.StatusOK, meals)
}

func getMeal(c *gin.Context) {
	id := c.Param("id")
	
	rows, err := db.Query(`
		SELECT m.id, m.name, m.datetime, 
		       i.id, i.name, i.quantity, i.carbs, i.fat, i.protein, i.kcal, i.macro_unit
		FROM meals m
		LEFT JOIN meal_ingredients mi ON m.id = mi.meal_id
		LEFT JOIN ingredients i ON mi.ingredient_id = i.id
		WHERE m.id = $1
	`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var meal *Meal
	for rows.Next() {
		var mealID int
		var mealName, mealDateTime string
		var ingredientID sql.NullInt64
		var ingredientName sql.NullString
		var quantity, carbs, fat, protein, kcal sql.NullFloat64
		var macroUnit sql.NullString

		err := rows.Scan(&mealID, &mealName, &mealDateTime, &ingredientID, &ingredientName, &quantity, &carbs, &fat, &protein, &kcal, &macroUnit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if meal == nil {
			meal = &Meal{
				ID:          mealID,
				Name:        mealName,
				DateTime:    mealDateTime,
				Ingredients: []Ingredient{},
			}
		}

		if ingredientID.Valid {
			ingredient := Ingredient{
				ID:        int(ingredientID.Int64),
				Name:      ingredientName.String,
				Quantity:  quantity.Float64,
				Carbs:     carbs.Float64,
				Fat:       fat.Float64,
				Protein:   protein.Float64,
				Kcal:      kcal.Float64,
				MacroUnit: macroUnit.String,
			}
			meal.Ingredients = append(meal.Ingredients, ingredient)
		}
	}

	if meal == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Meal not found"})
		return
	}

	c.JSON(http.StatusOK, meal)
}

func createMeal(c *gin.Context) {
	var meal Meal
	if err := c.ShouldBindJSON(&meal); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx, err := db.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer tx.Rollback()

	// Insert meal
	var mealID int
	err = tx.QueryRow("INSERT INTO meals (name, datetime) VALUES ($1, $2) RETURNING id", meal.Name, meal.DateTime).Scan(&mealID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Insert ingredients and link them to meal
	for _, ingredient := range meal.Ingredients {
		var ingredientID int
		err = tx.QueryRow(`
			INSERT INTO ingredients (name, quantity, carbs, fat, protein, kcal, macro_unit) 
			VALUES ($1, $2, $3, $4, $5, $6, $7) 
			RETURNING id
		`, ingredient.Name, ingredient.Quantity, ingredient.Carbs, ingredient.Fat, ingredient.Protein, ingredient.Kcal, ingredient.MacroUnit).Scan(&ingredientID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		_, err = tx.Exec("INSERT INTO meal_ingredients (meal_id, ingredient_id) VALUES ($1, $2)", mealID, ingredientID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	if err = tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	meal.ID = mealID
	c.JSON(http.StatusCreated, meal)
}

func updateMeal(c *gin.Context) {
	id := c.Param("id")
	var meal Meal
	if err := c.ShouldBindJSON(&meal); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx, err := db.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer tx.Rollback()

	// Update meal
	_, err = tx.Exec("UPDATE meals SET name = $1, datetime = $2 WHERE id = $3", meal.Name, meal.DateTime, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Delete existing meal-ingredient relationships
	_, err = tx.Exec("DELETE FROM meal_ingredients WHERE meal_id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Insert new ingredients and link them to meal
	for _, ingredient := range meal.Ingredients {
		var ingredientID int
		err = tx.QueryRow(`
			INSERT INTO ingredients (name, quantity, carbs, fat, protein, kcal, macro_unit) 
			VALUES ($1, $2, $3, $4, $5, $6, $7) 
			RETURNING id
		`, ingredient.Name, ingredient.Quantity, ingredient.Carbs, ingredient.Fat, ingredient.Protein, ingredient.Kcal, ingredient.MacroUnit).Scan(&ingredientID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		_, err = tx.Exec("INSERT INTO meal_ingredients (meal_id, ingredient_id) VALUES ($1, $2)", id, ingredientID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	if err = tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, meal)
}

func deleteMeal(c *gin.Context) {
	id := c.Param("id")
	
	_, err := db.Exec("DELETE FROM meals WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Meal deleted successfully"})
}

func getIngredients(c *gin.Context) {
	rows, err := db.Query("SELECT id, name, quantity, carbs, fat, protein, kcal, macro_unit FROM ingredients ORDER BY name")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var ingredients []Ingredient
	for rows.Next() {
		var ingredient Ingredient
		err := rows.Scan(&ingredient.ID, &ingredient.Name, &ingredient.Quantity, &ingredient.Carbs, &ingredient.Fat, &ingredient.Protein, &ingredient.Kcal, &ingredient.MacroUnit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		ingredients = append(ingredients, ingredient)
	}

	c.JSON(http.StatusOK, ingredients)
}

func createIngredient(c *gin.Context) {
	var ingredient Ingredient
	if err := c.ShouldBindJSON(&ingredient); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var id int
	err := db.QueryRow(`
		INSERT INTO ingredients (name, quantity, carbs, fat, protein, kcal, macro_unit) 
		VALUES ($1, $2, $3, $4, $5, $6, $7) 
		RETURNING id
	`, ingredient.Name, ingredient.Quantity, ingredient.Carbs, ingredient.Fat, ingredient.Protein, ingredient.Kcal, ingredient.MacroUnit).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ingredient.ID = id
	c.JSON(http.StatusCreated, ingredient)
}

// Ingredient Template handlers
func getIngredientTemplates(c *gin.Context) {
	rows, err := db.Query("SELECT id, name, carbs, fat, protein, kcal, macro_unit, created_at, updated_at FROM ingredient_templates ORDER BY name")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var templates []IngredientTemplate
	for rows.Next() {
		var template IngredientTemplate
		var createdAt, updatedAt sql.NullString
		err := rows.Scan(&template.ID, &template.Name, &template.Carbs, &template.Fat, &template.Protein, &template.Kcal, &template.MacroUnit, &createdAt, &updatedAt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if createdAt.Valid {
			template.CreatedAt = createdAt.String
		}
		if updatedAt.Valid {
			template.UpdatedAt = updatedAt.String
		}
		templates = append(templates, template)
	}

	c.JSON(http.StatusOK, templates)
}

func createIngredientTemplate(c *gin.Context) {
	var template IngredientTemplate
	if err := c.ShouldBindJSON(&template); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var id int
	err := db.QueryRow(`
		INSERT INTO ingredient_templates (name, carbs, fat, protein, kcal, macro_unit) 
		VALUES ($1, $2, $3, $4, $5, $6) 
		RETURNING id
	`, template.Name, template.Carbs, template.Fat, template.Protein, template.Kcal, template.MacroUnit).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	template.ID = id
	c.JSON(http.StatusCreated, template)
}

func updateIngredientTemplate(c *gin.Context) {
	id := c.Param("id")
	var template IngredientTemplate
	if err := c.ShouldBindJSON(&template); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := db.Exec(`
		UPDATE ingredient_templates 
		SET name = $1, carbs = $2, fat = $3, protein = $4, kcal = $5, macro_unit = $6, updated_at = CURRENT_TIMESTAMP
		WHERE id = $7
	`, template.Name, template.Carbs, template.Fat, template.Protein, template.Kcal, template.MacroUnit, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, template)
}

func deleteIngredientTemplate(c *gin.Context) {
	id := c.Param("id")
	
	_, err := db.Exec("DELETE FROM ingredient_templates WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ingredient template deleted successfully"})
}

// Meal Template handlers
func getMealTemplates(c *gin.Context) {
	rows, err := db.Query(`
		SELECT mt.id, mt.name, mt.description, mt.created_at, mt.updated_at,
		       it.id, it.name, it.carbs, it.fat, it.protein, it.kcal, it.macro_unit,
		       mti.quantity
		FROM meal_templates mt
		LEFT JOIN meal_template_ingredients mti ON mt.id = mti.meal_template_id
		LEFT JOIN ingredient_templates it ON mti.ingredient_template_id = it.id
		ORDER BY mt.name, it.name
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	templatesMap := make(map[int]*MealTemplate)
	for rows.Next() {
		var templateID int
		var templateName, templateDescription, createdAt, updatedAt sql.NullString
		var ingredientID sql.NullInt64
		var ingredientName sql.NullString
		var carbs, fat, protein, kcal sql.NullFloat64
		var macroUnit sql.NullString
		var quantity sql.NullFloat64

		err := rows.Scan(&templateID, &templateName, &templateDescription, &createdAt, &updatedAt,
			&ingredientID, &ingredientName, &carbs, &fat, &protein, &kcal, &macroUnit, &quantity)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		template, exists := templatesMap[templateID]
		if !exists {
			template = &MealTemplate{
				ID:          templateID,
				Name:        templateName.String,
				Description: templateDescription.String,
				Ingredients: []IngredientTemplate{},
				CreatedAt:   createdAt.String,
				UpdatedAt:   updatedAt.String,
			}
			templatesMap[templateID] = template
		}

		if ingredientID.Valid {
			ingredient := IngredientTemplate{
				ID:         int(ingredientID.Int64),
				Name:       ingredientName.String,
				Carbs:      carbs.Float64,
				Fat:        fat.Float64,
				Protein:    protein.Float64,
				Kcal:       kcal.Float64,
				MacroUnit:  macroUnit.String,
				Quantity:   quantity.Float64,
				CreatedAt:  "",
				UpdatedAt:  "",
			}
			template.Ingredients = append(template.Ingredients, ingredient)
		}
	}

	templates := make([]MealTemplate, 0, len(templatesMap))
	for _, template := range templatesMap {
		templates = append(templates, *template)
	}

	c.JSON(http.StatusOK, templates)
}

func getMealTemplate(c *gin.Context) {
	id := c.Param("id")
	
	rows, err := db.Query(`
		SELECT mt.id, mt.name, mt.description, mt.created_at, mt.updated_at,
		       it.id, it.name, it.carbs, it.fat, it.protein, it.kcal, it.macro_unit,
		       mti.quantity
		FROM meal_templates mt
		LEFT JOIN meal_template_ingredients mti ON mt.id = mti.meal_template_id
		LEFT JOIN ingredient_templates it ON mti.ingredient_template_id = it.id
		WHERE mt.id = $1
		ORDER BY it.name
	`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var template *MealTemplate
	for rows.Next() {
		var templateID int
		var templateName, templateDescription, createdAt, updatedAt sql.NullString
		var ingredientID sql.NullInt64
		var ingredientName sql.NullString
		var carbs, fat, protein, kcal sql.NullFloat64
		var macroUnit sql.NullString
		var quantity sql.NullFloat64

		err := rows.Scan(&templateID, &templateName, &templateDescription, &createdAt, &updatedAt,
			&ingredientID, &ingredientName, &carbs, &fat, &protein, &kcal, &macroUnit, &quantity)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if template == nil {
			template = &MealTemplate{
				ID:          templateID,
				Name:        templateName.String,
				Description: templateDescription.String,
				Ingredients: []IngredientTemplate{},
				CreatedAt:   createdAt.String,
				UpdatedAt:   updatedAt.String,
			}
		}

		if ingredientID.Valid {
			ingredient := IngredientTemplate{
				ID:         int(ingredientID.Int64),
				Name:       ingredientName.String,
				Carbs:      carbs.Float64,
				Fat:        fat.Float64,
				Protein:    protein.Float64,
				Kcal:       kcal.Float64,
				MacroUnit:  macroUnit.String,
				Quantity:   quantity.Float64,
				CreatedAt:  "",
				UpdatedAt:  "",
			}
			template.Ingredients = append(template.Ingredients, ingredient)
		}
	}

	if template == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Meal template not found"})
		return
	}

	c.JSON(http.StatusOK, template)
}

func createMealTemplate(c *gin.Context) {
	var template MealTemplate
	if err := c.ShouldBindJSON(&template); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx, err := db.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer tx.Rollback()

	// Insert meal template
	var templateID int
	err = tx.QueryRow("INSERT INTO meal_templates (name, description) VALUES ($1, $2) RETURNING id", 
		template.Name, template.Description).Scan(&templateID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Insert meal template ingredients
	for _, ingredient := range template.Ingredients {
		quantity := ingredient.Quantity
		if quantity == 0 {
			quantity = 1.0 // Default to 1 if not specified
		}
		_, err = tx.Exec("INSERT INTO meal_template_ingredients (meal_template_id, ingredient_template_id, quantity) VALUES ($1, $2, $3)", 
			templateID, ingredient.ID, quantity)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	if err = tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	template.ID = templateID
	c.JSON(http.StatusCreated, template)
}

func updateMealTemplate(c *gin.Context) {
	id := c.Param("id")
	var template MealTemplate
	if err := c.ShouldBindJSON(&template); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx, err := db.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer tx.Rollback()

	// Update meal template
	_, err = tx.Exec("UPDATE meal_templates SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3", 
		template.Name, template.Description, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Delete existing meal template ingredients
	_, err = tx.Exec("DELETE FROM meal_template_ingredients WHERE meal_template_id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Insert new meal template ingredients
	for _, ingredient := range template.Ingredients {
		quantity := ingredient.Quantity
		if quantity == 0 {
			quantity = 1.0 // Default to 1 if not specified
		}
		_, err = tx.Exec("INSERT INTO meal_template_ingredients (meal_template_id, ingredient_template_id, quantity) VALUES ($1, $2, $3)", 
			id, ingredient.ID, quantity)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	if err = tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, template)
}

func deleteMealTemplate(c *gin.Context) {
	id := c.Param("id")
	
	_, err := db.Exec("DELETE FROM meal_templates WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Meal template deleted successfully"})
}
