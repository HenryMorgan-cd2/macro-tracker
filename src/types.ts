export interface Ingredient {
  id?: number;
  name: string;
  quantity: number;
  carbs: number;
  fat: number;
  protein: number;
  kcal: number;
  macroUnit: 'per_unit' | 'per_100g';
}

export interface IngredientTemplate {
  id?: number;
  name: string;
  carbs: number;
  fat: number;
  protein: number;
  kcal: number;
  macroUnit: 'per_unit' | 'per_100g';
  defaultQuantity?: number; // Default quantity when used in meals
  quantity?: number; // Quantity when used in meal templates
}

export interface MealTemplate {
  id?: number;
  name: string;
  description?: string;
  ingredients: IngredientTemplate[];
  createdAt?: string;
  updatedAt?: string;
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

export interface DailyTargets {
  id?: number;
  carbs?: {
    min?: number;
    max?: number;
  };
  fat?: {
    min?: number;
    max?: number;
  };
  protein?: {
    min?: number;
    max?: number;
  };
  kcal?: {
    min?: number;
    max?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface MacroProgress {
  current: number;
  min?: number;
  max?: number;
  percentage: number;
  status: 'below_min' | 'above_max' | 'within_range' | 'no_target';
}
