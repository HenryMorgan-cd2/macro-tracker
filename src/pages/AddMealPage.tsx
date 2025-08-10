import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IngredientTemplate } from '../types';
import { MealForm } from '../components/MealForm';
import { PageWrapper } from '../components/PageWrapper';
import { api } from '../api';

export function AddMealPage() {
  const [ingredientTemplates, setIngredientTemplates] = useState<IngredientTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadIngredientTemplates();
  }, []);

  const loadIngredientTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const templates = await api.getIngredientTemplates();
      setIngredientTemplates(templates);
    } catch (err) {
      console.error('Failed to load ingredient templates:', err);
      setError('Failed to load ingredient templates');
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
        <div>Loading ingredient templates...</div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper title="Add New Meal" subtitle="Error">
        <div style={{ color: 'red' }}>{error}</div>
        <button onClick={loadIngredientTemplates}>Retry</button>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Add New Meal" subtitle="Create a new meal entry">
      <MealForm
        initialData={undefined}
        onAfterSubmit={handleAfterSubmit}
        onCancel={handleCancel}
        ingredientTemplates={ingredientTemplates}
        onSaveAsTemplate={handleSaveIngredientTemplate}
      />
    </PageWrapper>
  );
}
