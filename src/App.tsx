import { useState, useEffect } from 'react';
import { css } from '@emotion/react';
import { Meal } from './types';
import { api } from './api';
import { MealForm } from './components/MealForm';
import { MealList } from './components/MealList';

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
  margin-bottom: 2rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  useEffect(() => {
    loadMeals();
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

  return (
    <div css={appContainer}>
      <header css={header}>
        <h1 css={headerTitle}>Macro Tracker</h1>
        <p css={headerSubtitle}>Track your meals and nutritional intake</p>
      </header>

      <main css={mainContent}>
        {error && <div css={errorMessage}>{error}</div>}
        
        {!showForm && (
          <button css={addButton} onClick={() => setShowForm(true)}>
            + Add New Meal
          </button>
        )}

        {showForm && (
          <MealForm
            meal={editingMeal || undefined}
            onSubmit={handleSubmitForm}
            onCancel={handleCancelForm}
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
      </main>
    </div>
  );
}

export default App;
