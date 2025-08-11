import { useState, useEffect } from 'react';
import { MealTemplate, IngredientTemplate } from '../types';
import { MealTemplateManager } from '../components/MealTemplateManager';
import { PageWrapper } from '../components/PageWrapper';
import { api } from '../api';

export function MealTemplatesPage() {
  const [mealTemplates, setMealTemplates] = useState<MealTemplate[]>([]);
  const [ingredientTemplates, setIngredientTemplates] = useState<IngredientTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [templates, ingredients] = await Promise.all([
        api.getMealTemplates(),
        api.getIngredientTemplates()
      ]);
      
      setMealTemplates(templates);
      setIngredientTemplates(ingredients);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMealTemplate = async (template: Omit<MealTemplate, 'id'>) => {
    try {
      const newTemplate = await api.createMealTemplate(template);
      setMealTemplates(prev => [...prev, newTemplate]);
    } catch (err) {
      console.error('Failed to save meal template:', err);
      setError('Failed to save meal template');
    }
  };

  const handleUpdateMealTemplate = async (id: number, template: Omit<MealTemplate, 'id'>) => {
    try {
      const updatedTemplate = await api.updateMealTemplate(id, template);
      setMealTemplates(prev => 
        prev.map(t => t.id === id ? updatedTemplate : t)
      );
    } catch (err) {
      console.error('Failed to update meal template:', err);
      setError('Failed to update meal template');
    }
  };

  const handleDeleteMealTemplate = async (id: number) => {
    try {
      await api.deleteMealTemplate(id);
      setMealTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete meal template:', err);
      setError('Failed to delete meal template');
    }
  };

  const handleUseTemplate = (template: MealTemplate) => {
    // This could navigate to the Add Meal page with the template pre-filled
    // For now, we'll just show an alert
    alert(`Template "${template.name}" selected! This would typically navigate to the Add Meal page with the template ingredients pre-filled.`);
  };

  if (loading) {
    return (
      <PageWrapper title="Meal Templates" subtitle="Loading...">
        <div>Loading meal templates...</div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper title="Meal Templates" subtitle="Error">
        <div style={{ color: 'red' }}>{error}</div>
        <button onClick={loadData}>Retry</button>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Meal Templates" subtitle="Create and manage meal templates for quick meal creation">
      <MealTemplateManager
        templates={mealTemplates}
        ingredientTemplates={ingredientTemplates}
        onSaveTemplate={handleSaveMealTemplate}
        onUpdateTemplate={handleUpdateMealTemplate}
        onDeleteTemplate={handleDeleteMealTemplate}
        onUseTemplate={handleUseTemplate}
        onClose={() => {}} // No-op since we're not using a modal
      />
    </PageWrapper>
  );
}
