import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IngredientTemplate } from '../types';
import { MealForm } from '../components/MealForm';
import { PageWrapper } from '../components/PageWrapper';

export function AddMealPage() {
  const [ingredientTemplates, setIngredientTemplates] = useState<IngredientTemplate[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadIngredientTemplates();
  }, []);

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
