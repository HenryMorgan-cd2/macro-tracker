import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IngredientTemplate, Meal } from '../types';
import { api } from '../api';
import { MealForm } from '../components/MealForm';
import { PageWrapper } from '../components/PageWrapper';

export function EditMealPage() {
  const [ingredientTemplates, setIngredientTemplates] = useState<IngredientTemplate[]>([]);
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      loadMeal(parseInt(id));
    }
    loadIngredientTemplates();
  }, [id]);

  const loadMeal = async (mealId: number) => {
    try {
      setLoading(true);
      setError(null);
      const meals = await api.getMeals();
      const foundMeal = meals.find(m => m.id === mealId);
      if (foundMeal) {
        setMeal(foundMeal);
      } else {
        setError('Meal not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meal');
    } finally {
      setLoading(false);
    }
  };

  const loadIngredientTemplates = async () => {
    try {
      const stored = localStorage.getItem('ingredientTemplates');
      if (stored) {
        setIngredientTemplates(JSON.parse(stored));
      } else {
        const defaultTemplates: IngredientTemplate[] = [
          {
            id: 1,
            name: 'Bell Pepper',
            carbs: 6.0,
            fat: 0.2,
            protein: 1.0,
            kcal: 31,
            macroUnit: 'per_100g',
          },
          {
            id: 2,
            name: 'Chicken Breast',
            carbs: 0.0,
            fat: 3.6,
            protein: 31.0,
            kcal: 165,
            macroUnit: 'per_100g',
          },
          {
            id: 3,
            name: 'Brown Rice',
            carbs: 23.0,
            fat: 0.9,
            protein: 2.9,
            kcal: 111,
            macroUnit: 'per_100g',
          },
          {
            id: 4,
            name: 'Broccoli',
            carbs: 6.0,
            fat: 0.4,
            protein: 2.8,
            kcal: 34,
            macroUnit: 'per_100g',
          },
          {
            id: 5,
            name: 'Salmon',
            carbs: 0.0,
            fat: 13.0,
            protein: 20.0,
            kcal: 208,
            macroUnit: 'per_100g',
          },
          {
            id: 6,
            name: 'Sweet Potato',
            carbs: 20.0,
            fat: 0.1,
            protein: 1.6,
            kcal: 86,
            macroUnit: 'per_100g',
          },
          {
            id: 7,
            name: 'Spinach',
            carbs: 3.6,
            fat: 0.4,
            protein: 2.9,
            kcal: 23,
            macroUnit: 'per_100g',
          },
          {
            id: 8,
            name: 'Eggs',
            carbs: 0.6,
            fat: 5.0,
            protein: 6.3,
            kcal: 74,
            macroUnit: 'per_unit',
          },
        ];
        
        setIngredientTemplates(defaultTemplates);
        localStorage.setItem('ingredientTemplates', JSON.stringify(defaultTemplates));
      }
    } catch (err) {
      console.error('Failed to load ingredient templates:', err);
    }
  };

  const handleSaveIngredientTemplate = (template: Omit<IngredientTemplate, 'id'>) => {
    const newTemplate: IngredientTemplate = {
      ...template,
      id: Date.now(),
    };
    
    const updatedTemplates = [...ingredientTemplates, newTemplate];
    setIngredientTemplates(updatedTemplates);
    localStorage.setItem('ingredientTemplates', JSON.stringify(updatedTemplates));
  };

  const handleAfterSubmit = () => {
    navigate('/');
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <PageWrapper title="Edit Meal" subtitle="Edit meal details">
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading meal...</div>
      </PageWrapper>
    );
  }

  if (error || !meal) {
    return (
      <PageWrapper title="Edit Meal" subtitle="Edit meal details">
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '1rem', 
          borderRadius: '4px', 
          border: '1px solid #f5c6cb' 
        }}>
          {error || 'Meal not found'}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Edit Meal" subtitle="Edit meal details">
      <MealForm
        initialData={meal}
        onAfterSubmit={handleAfterSubmit}
        onCancel={handleCancel}
        ingredientTemplates={ingredientTemplates}
        onSaveAsTemplate={handleSaveIngredientTemplate}
      />
    </PageWrapper>
  );
}
