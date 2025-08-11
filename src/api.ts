import { Meal, Ingredient, IngredientTemplate, MealTemplate, DailyTargets } from './types';

const API_BASE = '/api';

export const api = {
  // Meals
  async getMeals(): Promise<Meal[]> {
    const response = await fetch(`${API_BASE}/meals`);
    if (!response.ok) throw new Error('Failed to fetch meals');
    return response.json();
  },

  async getMeal(id: number): Promise<Meal> {
    const response = await fetch(`${API_BASE}/meals/${id}`);
    if (!response.ok) throw new Error('Failed to fetch meal');
    return response.json();
  },

  async createMeal(meal: Omit<Meal, 'id'>): Promise<Meal> {
    const response = await fetch(`${API_BASE}/meals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meal),
    });
    if (!response.ok) throw new Error('Failed to create meal');
    return response.json();
  },

  async updateMeal(id: number, meal: Omit<Meal, 'id'>): Promise<Meal> {
    const response = await fetch(`${API_BASE}/meals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meal),
    });
    if (!response.ok) throw new Error('Failed to update meal');
    return response.json();
  },

  async deleteMeal(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/meals/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete meal');
  },

  // Ingredients
  async getIngredients(): Promise<Ingredient[]> {
    const response = await fetch(`${API_BASE}/ingredients`);
    if (!response.ok) throw new Error('Failed to fetch ingredients');
    return response.json();
  },

  async createIngredient(ingredient: Omit<Ingredient, 'id'>): Promise<Ingredient> {
    const response = await fetch(`${API_BASE}/ingredients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ingredient),
    });
    if (!response.ok) throw new Error('Failed to create ingredient');
    return response.json();
  },

  // Ingredient Templates
  async getIngredientTemplates(): Promise<IngredientTemplate[]> {
    const response = await fetch(`${API_BASE}/ingredient-templates`);
    if (!response.ok) throw new Error('Failed to fetch ingredient templates');
    return response.json();
  },

  async createIngredientTemplate(template: Omit<IngredientTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<IngredientTemplate> {
    const response = await fetch(`${API_BASE}/ingredient-templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    });
    if (!response.ok) throw new Error('Failed to create ingredient template');
    return response.json();
  },

  async updateIngredientTemplate(id: number, template: Omit<IngredientTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<IngredientTemplate> {
    const response = await fetch(`${API_BASE}/ingredient-templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    });
    if (!response.ok) throw new Error('Failed to update ingredient template');
    return response.json();
  },

  async deleteIngredientTemplate(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/ingredient-templates/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete ingredient template');
  },

  // Meal Templates
  async getMealTemplates(): Promise<MealTemplate[]> {
    const response = await fetch(`${API_BASE}/meal-templates`);
    if (!response.ok) throw new Error('Failed to fetch meal templates');
    return response.json();
  },

  async getMealTemplate(id: number): Promise<MealTemplate> {
    const response = await fetch(`${API_BASE}/meal-templates/${id}`);
    if (!response.ok) throw new Error('Failed to fetch meal template');
    return response.json();
  },

  async createMealTemplate(template: Omit<MealTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<MealTemplate> {
    const response = await fetch(`${API_BASE}/meal-templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    });
    if (!response.ok) throw new Error('Failed to create meal template');
    return response.json();
  },

  async updateMealTemplate(id: number, template: Omit<MealTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<MealTemplate> {
    const response = await fetch(`${API_BASE}/meal-templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    });
    if (!response.ok) throw new Error('Failed to update meal template');
    return response.json();
  },

  async deleteMealTemplate(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/meal-templates/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete meal template');
  },

  // Daily Targets
  async getDailyTargets(): Promise<DailyTargets> {
    const response = await fetch(`${API_BASE}/daily-targets`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Daily targets not found');
      }
      throw new Error('Failed to fetch daily targets');
    }
    return response.json();
  },

  async createDailyTargets(targets: Omit<DailyTargets, 'id' | 'createdAt' | 'updatedAt'>): Promise<DailyTargets> {
    const response = await fetch(`${API_BASE}/daily-targets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(targets),
    });
    if (!response.ok) throw new Error('Failed to create daily targets');
    return response.json();
  },

  async updateDailyTargets(id: number, targets: Omit<DailyTargets, 'id' | 'createdAt' | 'updatedAt'>): Promise<DailyTargets> {
    const response = await fetch(`${API_BASE}/daily-targets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(targets),
    });
    if (!response.ok) throw new Error('Failed to update daily targets');
    return response.json();
  },

  async deleteDailyTargets(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/daily-targets/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete daily targets');
  },
};
