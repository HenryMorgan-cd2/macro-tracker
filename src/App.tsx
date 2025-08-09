import { useState, useEffect } from 'react';
import { css } from '@emotion/react';
import { Meal, IngredientTemplate } from './types';
import { api } from './api';
import { MealForm } from './components/MealForm';
import { MealList } from './components/MealList';
import { IngredientTemplateManager } from './components/IngredientTemplateManager';

const appContainer = css`
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const header = css`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const headerTitle = css`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  margin-bottom: 0.5rem;
`;

const headerSubtitle = css`
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
`;

const mainContent = css`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const buttonRow = css`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const addButton = css`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  }
`;

const templateButton = css`
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(40, 167, 69, 0.4);
  }
`;

const loadingMessage = css`
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #666;
`;

const errorMessage = css`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
`;

function App() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [ingredientTemplates, setIngredientTemplates] = useState<IngredientTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  useEffect(() => {
    loadMeals();
    loadIngredientTemplates();
  }, []);

  const loadMeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const mealsData = await api.getMeals();
      setMeals(mealsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meals');
    } finally {
      setLoading(false);
    }
  };

  const loadIngredientTemplates = async () => {
    try {
      // For now, we'll use localStorage for templates
      // In a real app, you'd fetch from an API
      const stored = localStorage.getItem('ingredientTemplates');
      if (stored) {
        setIngredientTemplates(JSON.parse(stored));
      } else {
        // Initialize with some common ingredient templates
        const defaultTemplates: IngredientTemplate[] = [
          {
            id: 1,
            name: 'Bell Pepper',
            carbs: 6.0,
            fat: 0.2,
            protein: 1.0,
            kcal: 31,
          },
          {
            id: 2,
            name: 'Chicken Breast',
            carbs: 0.0,
            fat: 3.6,
            protein: 31.0,
            kcal: 165,
          },
          {
            id: 3,
            name: 'Brown Rice',
            carbs: 23.0,
            fat: 0.9,
            protein: 2.9,
            kcal: 111,
          },
          {
            id: 4,
            name: 'Broccoli',
            carbs: 6.0,
            fat: 0.4,
            protein: 2.8,
            kcal: 34,
          },
          {
            id: 5,
            name: 'Salmon',
            carbs: 0.0,
            fat: 13.0,
            protein: 20.0,
            kcal: 208,
          },
          {
            id: 6,
            name: 'Sweet Potato',
            carbs: 20.0,
            fat: 0.1,
            protein: 1.6,
            kcal: 86,
          },
          {
            id: 7,
            name: 'Spinach',
            carbs: 3.6,
            fat: 0.4,
            protein: 2.9,
            kcal: 23,
          },
          {
            id: 8,
            name: 'Eggs',
            carbs: 0.6,
            fat: 5.0,
            protein: 6.3,
            kcal: 74,
          },
        ];
        
        setIngredientTemplates(defaultTemplates);
        localStorage.setItem('ingredientTemplates', JSON.stringify(defaultTemplates));
      }
    } catch (err) {
      console.error('Failed to load ingredient templates:', err);
    }
  };

  const handleAddMeal = async (mealData: Omit<Meal, 'id'>) => {
    try {
      setError(null);
      const newMeal = await api.createMeal(mealData);
      setMeals(prev => [...prev, newMeal]);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add meal');
    }
  };

  const handleUpdateMeal = async (mealData: Omit<Meal, 'id'>) => {
    if (!editingMeal?.id) return;
    
    try {
      setError(null);
      const updatedMeal = await api.updateMeal(editingMeal.id, mealData);
      setMeals(prev => prev.map(meal => meal.id === editingMeal.id ? updatedMeal : meal));
      setEditingMeal(null);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update meal');
    }
  };

  const handleDeleteMeal = async (id: number) => {
    try {
      setError(null);
      await api.deleteMeal(id);
      setMeals(prev => prev.filter(meal => meal.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete meal');
    }
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingMeal(null);
  };

  const handleSubmitForm = (mealData: Omit<Meal, 'id'>) => {
    if (editingMeal) {
      handleUpdateMeal(mealData);
    } else {
      handleAddMeal(mealData);
    }
  };

  const handleSaveIngredientTemplate = (template: Omit<IngredientTemplate, 'id'>) => {
    const newTemplate: IngredientTemplate = {
      ...template,
      id: Date.now(), // Simple ID generation for now
    };
    
    const updatedTemplates = [...ingredientTemplates, newTemplate];
    setIngredientTemplates(updatedTemplates);
    
    // Save to localStorage
    localStorage.setItem('ingredientTemplates', JSON.stringify(updatedTemplates));
  };

  const handleUpdateIngredientTemplate = (id: number, template: Omit<IngredientTemplate, 'id'>) => {
    const updatedTemplates = ingredientTemplates.map(t => 
      t.id === id ? { ...template, id } : t
    );
    setIngredientTemplates(updatedTemplates);
    
    // Save to localStorage
    localStorage.setItem('ingredientTemplates', JSON.stringify(updatedTemplates));
  };

  const handleDeleteIngredientTemplate = (id: number) => {
    const updatedTemplates = ingredientTemplates.filter(t => t.id !== id);
    setIngredientTemplates(updatedTemplates);
    
    // Save to localStorage
    localStorage.setItem('ingredientTemplates', JSON.stringify(updatedTemplates));
  };

  return (
    <div css={appContainer}>
      <header css={header}>
        <h1 css={headerTitle}>Macro Tracker</h1>
        <p css={headerSubtitle}>Track your meals and nutritional intake</p>
      </header>

      <main css={mainContent}>
        {error && <div css={errorMessage}>{error}</div>}
        
        {!showForm && (
          <div css={buttonRow}>
            <button css={addButton} onClick={() => setShowForm(true)}>
              + Add New Meal
            </button>
            <button css={templateButton} onClick={() => setShowTemplateManager(true)}>
              🧾 Manage Ingredient Templates
            </button>
          </div>
        )}

        {showForm && (
          <MealForm
            meal={editingMeal || undefined}
            onSubmit={handleSubmitForm}
            onCancel={handleCancelForm}
            ingredientTemplates={ingredientTemplates}
            onSaveAsTemplate={handleSaveIngredientTemplate}
          />
        )}

        {loading ? (
          <div css={loadingMessage}>Loading meals...</div>
        ) : (
          <MealList
            meals={meals}
            onEdit={handleEditMeal}
            onDelete={handleDeleteMeal}
          />
        )}

        {showTemplateManager && (
          <IngredientTemplateManager
            templates={ingredientTemplates}
            onSaveTemplate={handleSaveIngredientTemplate}
            onUpdateTemplate={handleUpdateIngredientTemplate}
            onDeleteTemplate={handleDeleteIngredientTemplate}
            onClose={() => setShowTemplateManager(false)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
