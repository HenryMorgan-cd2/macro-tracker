/** @jsxImportSource @emotion/react */
import React, { useState } from 'react';
import { css } from '@emotion/react';
import { Meal, Ingredient } from '../types';
import { NumberField } from './NumberField';

interface MealFormProps {
  meal?: Meal;
  onSubmit: (meal: Omit<Meal, 'id'>) => void;
  onCancel: () => void;
}

interface EditableIngredient extends Omit<Ingredient, 'carbs' | 'fat' | 'protein' | 'kcal'> {
  key: string;
  carbs: number | null;
  fat: number | null;
  protein: number | null;
  kcal: number | null;
}

export const MealForm: React.FC<MealFormProps> = ({ meal, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: meal?.name || '',
    datetime: meal?.datetime || new Date().toISOString().slice(0, 16),
    ingredients: (meal?.ingredients || []).map(ingredient => ({
      ...ingredient,
      carbs: ingredient.carbs || null,
      fat: ingredient.fat || null,
      protein: ingredient.protein || null,
      kcal: ingredient.kcal || null,
      key: Math.random().toString(36).substr(2, 9)
    })) as EditableIngredient[],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIngredientChange = (key: string, field: keyof EditableIngredient, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ingredient =>
        ingredient.key === key
          ? { ...ingredient, [field]: value }
          : ingredient
      )
    }));
  };

  const addIngredient = () => {
    const newIngredient: EditableIngredient = {
      key: Math.random().toString(36).substr(2, 9),
      name: '',
      carbs: null,
      fat: null,
      protein: null,
      kcal: null,
    };
    
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient],
    }));
  };

  const removeIngredient = (key: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ingredient => ingredient.key !== key),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Remove the key and convert null values to 0 before submitting
    const submitData = {
      ...formData,
      ingredients: formData.ingredients.map(({ key, carbs, fat, protein, kcal, ...ingredient }) => ({
        ...ingredient,
        carbs: carbs || 0,
        fat: fat || 0,
        protein: protein || 0,
        kcal: kcal || 0,
      }))
    };
    onSubmit(submitData);
  };

  return (
    <form css={css`
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      max-width: 600px;
      margin: 0 auto;
    `} onSubmit={handleSubmit}>
      <h2>{meal ? 'Edit Meal' : 'Add New Meal'}</h2>
      
      <div css={css`
        margin-bottom: 1rem;
      `}>
        <label css={css`
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
        `} htmlFor="name">Meal Name</label>
        <input
          css={css`
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
            
            &:focus {
              outline: none;
              border-color: #007bff;
              box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
            }
          `}
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>

      <div css={css`
        margin-bottom: 1rem;
      `}>
        <label css={css`
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
        `} htmlFor="datetime">Date & Time</label>
        <input
          css={css`
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
            
            &:focus {
              outline: none;
              border-color: #007bff;
              box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
            }
          `}
          type="datetime-local"
          id="datetime"
          name="datetime"
          value={formData.datetime}
          onChange={handleInputChange}
          required
        />
      </div>

      <div css={css`
        margin-bottom: 1rem;
      `}>
        <label css={css`
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
        `}>Ingredients</label>
        <div css={css`
          margin-top: 1rem;
        `}>
          {formData.ingredients.map((ingredient) => (
            <div key={ingredient.key} css={css`
              background: #f8f9fa;
              padding: 1rem;
              border-radius: 4px;
              border-left: 4px solid #007bff;
              margin-bottom: 0.5rem;
            `}>
              <div css={css`
                display: grid;
                grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto;
                gap: 0.75rem;
                align-items: center;
              `}>
                <div css={css`
                  display: flex;
                  flex-direction: column;
                `}>
                  <label css={css`
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: #333;
                  `}>Name</label>
                  <input
                    css={css`
                      width: 100%;
                      padding: 0.5rem;
                      border: 1px solid #ddd;
                      border-radius: 4px;
                      font-size: 0.875rem;
                      
                      &:focus {
                        outline: none;
                        border-color: #007bff;
                        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
                      }
                    `}
                    type="text"
                    placeholder="e.g., Chicken Breast"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(ingredient.key, 'name', e.target.value)}
                  />
                </div>
                
                <NumberField
                  label="Carbs (g)"
                  value={ingredient.carbs}
                  onChange={(value) => handleIngredientChange(ingredient.key, 'carbs', value)}
                  placeholder="0"
                  step={0.1}
                  min={0}
                />
                
                <NumberField
                  label="Fat (g)"
                  value={ingredient.fat}
                  onChange={(value) => handleIngredientChange(ingredient.key, 'fat', value)}
                  placeholder="0"
                  step={0.1}
                  min={0}
                />
                
                <NumberField
                  label="Protein (g)"
                  value={ingredient.protein}
                  onChange={(value) => handleIngredientChange(ingredient.key, 'protein', value)}
                  placeholder="0"
                  step={0.1}
                  min={0}
                />
                
                <NumberField
                  label="Calories"
                  value={ingredient.kcal}
                  onChange={(value) => handleIngredientChange(ingredient.key, 'kcal', value)}
                  placeholder="0"
                  step={0.1}
                  min={0}
                />
                
                <button
                  type="button"
                  css={css`
                    padding: 0.25rem 0.5rem;
                    border: none;
                    border-radius: 4px;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    background-color: #dc3545;
                    color: white;
                    height: fit-content;
                    
                    &:hover {
                      background-color: #c82333;
                    }
                  `}
                  onClick={() => removeIngredient(ingredient.key)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <button type="button" css={css`
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
          background-color: #007bff;
          color: white;
          width: 100%;
          margin-top: 1rem;
          
          &:hover {
            background-color: #0056b3;
          }
        `} onClick={addIngredient}>
          + Add New Ingredient
        </button>
      </div>

      <div css={css`
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
      `}>
        <button type="submit" css={css`
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
          background-color: #007bff;
          color: white;
          
          &:hover {
            background-color: #0056b3;
          }
        `}>
          {meal ? 'Update Meal' : 'Add Meal'}
        </button>
        <button type="button" css={css`
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
          background-color: #6c757d;
          color: white;
          
          &:hover {
            background-color: #545b62;
          }
        `} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};
