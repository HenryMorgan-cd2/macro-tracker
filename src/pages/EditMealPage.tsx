import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IngredientTemplate, Meal, MealTemplate } from '../types';
import { api } from '../api';
import { MealForm } from '../components/MealForm';
import { PageWrapper } from '../components/PageWrapper';

export function EditMealPage() {
  const [ingredientTemplates, setIngredientTemplates] = useState<IngredientTemplate[]>([]);
  const [mealTemplates, setMealTemplates] = useState<MealTemplate[]>([]);
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      loadMeal(parseInt(id));
    }
    loadData();
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

  const loadData = async () => {
    try {
      const [ingredients, meals] = await Promise.all([
        api.getIngredientTemplates(),
        api.getMealTemplates()
      ]);
      setIngredientTemplates(ingredients);
      setMealTemplates(meals);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const handleSaveIngredientTemplate = async (template: Omit<IngredientTemplate, 'id'>) => {
    try {
      const newTemplate = await api.createIngredientTemplate(template);
      setIngredientTemplates(prev => [...prev, newTemplate]);
    } catch (err) {
      console.error('Failed to save ingredient template:', err);
    }
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
        mealTemplates={mealTemplates}
        onSaveAsTemplate={handleSaveIngredientTemplate}
      />
    </PageWrapper>
  );
}
