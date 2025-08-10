import { Meal, Ingredient, IngredientTemplate } from './types';

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
};
