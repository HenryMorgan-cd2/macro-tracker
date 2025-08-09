export interface Ingredient {
  id?: number;
  name: string;
  quantity: number;
  carbs: number;
  fat: number;
  protein: number;
  kcal: number;
}

export interface IngredientTemplate {
  id?: number;
  name: string;
  carbs: number;
  fat: number;
  protein: number;
  kcal: number;
}

export interface Meal {
  id?: number;
  name: string;
  datetime: string;
  ingredients: Ingredient[];
}

export interface MealFormData {
  name: string;
  datetime: string;
  ingredients: Ingredient[];
}
