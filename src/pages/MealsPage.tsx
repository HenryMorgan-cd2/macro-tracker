import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { css } from '@emotion/react';
import { Meal } from '../types';
import { api } from '../api';
import { MealList } from '../components/MealList';
import { PageWrapper } from '../components/PageWrapper';

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

export function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
    navigate(`/edit-meal/${meal.id}`);
  };

  const handleDuplicateMeal = (meal: Meal) => {
    // Navigate to add meal page with the meal data as initial data
    // We'll use URL state to pass the data
    navigate('/add-meal', { 
      state: { 
        duplicateMeal: {
          ...meal,
          id: undefined, // Remove the ID so it creates a new meal
          datetime: new Date().toISOString() // Set to current time
        }
      } 
    });
  };

  return (
    <PageWrapper title="Meals" subtitle="Track your daily meals and nutritional intake">
      {error && <div css={errorMessage}>{error}</div>}
      
      {loading ? (
        <div css={loadingMessage}>Loading meals...</div>
      ) : (
        <MealList
          meals={meals}
          onEdit={handleEditMeal}
          onDelete={handleDeleteMeal}
          onDuplicate={handleDuplicateMeal}
        />
      )}
    </PageWrapper>
  );
}
