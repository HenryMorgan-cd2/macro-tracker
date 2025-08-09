import { Meal, Ingredient } from './types';

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
};
