import { useState, useEffect } from 'react';
import { IngredientTemplate } from '../types';
import { IngredientTemplateManager } from '../components/IngredientTemplateManager';
import { PageWrapper } from '../components/PageWrapper';
import { api } from '../api';

export function TemplatesPage() {
  const [ingredientTemplates, setIngredientTemplates] = useState<IngredientTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleUpdateIngredientTemplate = async (id: number, template: Omit<IngredientTemplate, 'id'>) => {
    try {
      const updatedTemplate = await api.updateIngredientTemplate(id, template);
      setIngredientTemplates(prev => 
        prev.map(t => t.id === id ? updatedTemplate : t)
      );
    } catch (err) {
      console.error('Failed to update ingredient template:', err);
      setError('Failed to update ingredient template');
    }
  };

  const handleDeleteIngredientTemplate = async (id: number) => {
    try {
      await api.deleteIngredientTemplate(id);
      setIngredientTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete ingredient template:', err);
      setError('Failed to delete ingredient template');
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Ingredient Templates" subtitle="Loading...">
        <div>Loading ingredient templates...</div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper title="Ingredient Templates" subtitle="Error">
        <div style={{ color: 'red' }}>{error}</div>
        <button onClick={loadIngredientTemplates}>Retry</button>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Ingredient Templates" subtitle="Manage your ingredient templates for quick meal creation">
      <IngredientTemplateManager
        templates={ingredientTemplates}
        onSaveTemplate={handleSaveIngredientTemplate}
        onUpdateTemplate={handleUpdateIngredientTemplate}
        onDeleteTemplate={handleDeleteIngredientTemplate}
        onClose={() => {}} // No-op since we're not using a modal
      />
    </PageWrapper>
  );
}
