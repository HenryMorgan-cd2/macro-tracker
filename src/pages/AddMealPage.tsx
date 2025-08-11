import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IngredientTemplate, MealTemplate } from '../types';
import { MealForm } from '../components/MealForm';
import { PageWrapper } from '../components/PageWrapper';
import { api } from '../api';

export function AddMealPage() {
  const [ingredientTemplates, setIngredientTemplates] = useState<IngredientTemplate[]>([]);
  const [mealTemplates, setMealTemplates] = useState<MealTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract duplicate meal data from navigation state if it exists
  const duplicateMeal = location.state?.duplicateMeal;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ingredients, meals] = await Promise.all([
        api.getIngredientTemplates(),
        api.getMealTemplates()
      ]);
      setIngredientTemplates(ingredients);
      setMealTemplates(meals);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIngredientTemplate = async (template: Omit<IngredientTemplate, 'id'>) => {
    try {
      const newTemplate = await api.createIngredientTemplate(template);
      setIngredientTemplates(prev => [...prev, newTemplate]);
    } catch (err) {
      console.error('Failed to save ingredient template:', err);
      setError('Failed to save ingredient template');
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
      <PageWrapper title="Add New Meal" subtitle="Loading...">
        <div>Loading data...</div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper title="Add New Meal" subtitle="Error">
        <div style={{ color: 'red' }}>{error}</div>
        <button onClick={loadData}>Retry</button>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper 
      title={duplicateMeal ? "Duplicate Meal" : "Add New Meal"} 
      subtitle={duplicateMeal ? `Duplicating "${duplicateMeal.name}"` : "Create a new meal entry"}
    >
      <MealForm
        initialData={duplicateMeal}
        onAfterSubmit={handleAfterSubmit}
        onCancel={handleCancel}
        ingredientTemplates={ingredientTemplates}
        mealTemplates={mealTemplates}
        onSaveAsTemplate={handleSaveIngredientTemplate}
      />
    </PageWrapper>
  );
}
