/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from 'react';
import { css } from '@emotion/react';
import { Meal, Ingredient, IngredientTemplate } from '../types';
import { NumberField } from './NumberField';
import { api } from '../api';

interface MealFormProps {
  initialData?: Meal;
  onAfterSubmit: () => void;
  onCancel: () => void;
  ingredientTemplates: IngredientTemplate[];
  onSaveAsTemplate: (template: Omit<IngredientTemplate, 'id'>) => void;
}

interface EditableIngredient extends Omit<Ingredient, 'carbs' | 'fat' | 'protein' | 'kcal' | 'quantity'> {
  key: string;
  quantity: number | null;
  carbs: number | null;
  fat: number | null;
  protein: number | null;
  kcal: number | null;
  macroUnit: 'per_unit' | 'per_100g';
}

export const MealForm: React.FC<MealFormProps> = ({ 
  initialData, 
  onAfterSubmit, 
  onCancel, 
  ingredientTemplates,
  onSaveAsTemplate 
}) => {
  // Helper function to format datetime for HTML datetime-local input
  const formatDateTimeForInput = (datetime: string) => {
    try {
      const date = new Date(datetime);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return new Date().toISOString().slice(0, 16);
      }
      
      // Format the date in local timezone (YYYY-MM-DDTHH:MM)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      return new Date().toISOString().slice(0, 16);
    }
  };

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    datetime: formatDateTimeForInput(initialData?.datetime || new Date().toISOString()),
    ingredients: (initialData?.ingredients || []).map((ingredient: Ingredient) => ({
      ...ingredient,
      quantity: ingredient.quantity || null,
      carbs: ingredient.carbs || null,
      fat: ingredient.fat || null,
      protein: ingredient.protein || null,
      kcal: ingredient.kcal || null,
      macroUnit: ingredient.macroUnit || 'per_unit',
      key: Math.random().toString(36).substr(2, 9)
    })) as EditableIngredient[],
  });

  // Update form data when initialData prop changes (for editing)
  useEffect(() => {
    console.log('MealForm: useEffect triggered, initialData:', initialData);
    if (initialData) {
      console.log('MealForm: Setting form data for initialData:', initialData);
      setFormData({
        name: initialData.name,
        datetime: formatDateTimeForInput(initialData.datetime),
        ingredients: initialData.ingredients.map((ingredient: Ingredient) => ({
          ...ingredient,
          quantity: ingredient.quantity || null,
          carbs: ingredient.carbs || null,
          fat: ingredient.fat || null,
          protein: ingredient.protein || null,
          kcal: ingredient.kcal || null,
          macroUnit: ingredient.macroUnit || 'per_unit',
          key: Math.random().toString(36).substr(2, 9)
        })) as EditableIngredient[],
      });
    }
  }, [initialData]);

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
      quantity: null,
      carbs: null,
      fat: null,
      protein: null,
      kcal: null,
      macroUnit: 'per_100g', // Default to per 100g as it's more common for packaged foods
    };
    
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient],
    }));
  };

  const addIngredientFromTemplate = (template: IngredientTemplate) => {
    const newIngredient: EditableIngredient = {
      key: Math.random().toString(36).substr(2, 9),
      name: template.name,
      quantity: 1, // Default to 1 unit
      carbs: template.carbs,
      fat: template.fat,
      protein: template.protein,
      kcal: template.kcal,
      macroUnit: template.macroUnit,
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





  const saveIngredientAsTemplate = (ingredient: EditableIngredient) => {
    if (ingredient.name && 
        ingredient.carbs !== null && 
        ingredient.fat !== null && 
        ingredient.protein !== null && 
        ingredient.kcal !== null) {
      onSaveAsTemplate({
        name: ingredient.name,
        carbs: ingredient.carbs,
        fat: ingredient.fat,
        protein: ingredient.protein,
        kcal: ingredient.kcal,
        macroUnit: ingredient.macroUnit,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission attempted');
    console.log('Form data:', formData);
    
    // Remove the key and convert null values to 0 before submitting
    const submitData = {
      ...formData,
      ingredients: formData.ingredients.map(({ key, carbs, fat, protein, kcal, quantity, macroUnit, ...ingredient }) => {
        return {
          ...ingredient,
          quantity: quantity || 1,
          carbs: carbs || 0,
          fat: fat || 0,
          protein: protein || 0,
          kcal: kcal || 0,
          macroUnit: macroUnit,
        };
      })
    };
    
    console.log('Submit data:', submitData);
    
    try {
      if (initialData?.id) {
        // Update existing meal
        console.log('Updating existing meal with ID:', initialData.id);
        await api.updateMeal(initialData.id, submitData);
      } else {
        // Create new meal
        console.log('Creating new meal');
        await api.createMeal(submitData);
      }
      
      console.log('Meal saved successfully');
      onAfterSubmit();
    } catch (error) {
      console.error('Error saving meal:', error);
      // You could add error state handling here if needed
    }
  };

  return (
    <form css={css`
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      max-width: 800px;
      margin: 0 auto;
      
      @media (max-width: 768px) {
        padding: 1rem;
        margin: 0 0.5rem;
      }
      
      @media (max-width: 480px) {
        padding: 0.75rem;
        margin: 0 0.25rem;
      }
    `} onSubmit={handleSubmit}>
      <h2>{initialData ? 'Edit Meal' : 'Add New Meal'}</h2>
      
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
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                margin-bottom: 0.75rem;
              `}>
                {/* Row 1: Name, Quantity, Actions */}
                <div css={css`
                  display: grid;
                  grid-template-columns: 2fr 1fr auto;
                  gap: 0.75rem;
                  align-items: end;
                  
                  @media (max-width: 480px) {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                  }
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
                    label="Quantity"
                    value={ingredient.quantity}
                    onChange={(value) => handleIngredientChange(ingredient.key, 'quantity', value)}
                    placeholder="0"
                    step={1}
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
                
                {/* Row 2: Macro Unit and Macros */}
                <div css={css`
                  display: grid;
                  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
                  gap: 0.75rem;
                  align-items: end;
                  
                  @media (max-width: 768px) {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                  }
                  
                  @media (max-width: 480px) {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                  }
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
                    `}>Macro Unit</label>
                    <select
                      css={css`
                        width: 100%;
                        padding: 0.5rem;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-size: 0.875rem;
                        background: white;
                        
                        &:focus {
                          outline: none;
                          border-color: #007bff;
                          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
                        }
                      `}
                      value={ingredient.macroUnit}
                      onChange={(e) => handleIngredientChange(ingredient.key, 'macroUnit', e.target.value as 'per_unit' | 'per_100g')}
                    >
                      <option value="per_unit">Per Unit</option>
                      <option value="per_100g">Per 100g</option>
                    </select>
                  </div>
                  
                  <NumberField
                    label={`Carbs (g) ${ingredient.macroUnit === 'per_100g' ? 'per 100g' : 'per unit'}`}
                    value={ingredient.carbs}
                    onChange={(value) => handleIngredientChange(ingredient.key, 'carbs', value)}
                    placeholder="0"
                    step={0.1}
                    min={0}
                  />
                  
                  <NumberField
                    label={`Fat (g) ${ingredient.macroUnit === 'per_100g' ? 'per 100g' : 'per unit'}`}
                    value={ingredient.fat}
                    onChange={(value) => handleIngredientChange(ingredient.key, 'fat', value)}
                    placeholder="0"
                    step={0.1}
                    min={0}
                  />
                  
                  <NumberField
                    label={`Protein (g) ${ingredient.macroUnit === 'per_100g' ? 'per 100g' : 'per unit'}`}
                    value={ingredient.protein}
                    onChange={(value) => handleIngredientChange(ingredient.key, 'protein', value)}
                    placeholder="0"
                    step={0.1}
                    min={0}
                  />
                  
                  <NumberField
                    label={`Calories ${ingredient.macroUnit === 'per_100g' ? 'per 100g' : 'per unit'}`}
                    value={ingredient.kcal}
                    onChange={(value) => handleIngredientChange(ingredient.key, 'kcal', value)}
                    placeholder="0"
                    step={0.1}
                    min={0}
                  />
                </div>
              </div>
              
              {/* Save as Template Button */}
              <div css={css`
                display: flex;
                justify-content: flex-end;
                padding-top: 0.75rem;
                border-top: 1px solid #dee2e6;
              `}>
                <button
                  type="button"
                  css={css`
                    padding: 0.25rem 0.75rem;
                    border: 1px solid #28a745;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    background-color: transparent;
                    color: #28a745;
                    
                    &:hover {
                      background-color: #28a745;
                      color: white;
                    }
                  `}
                  onClick={() => saveIngredientAsTemplate(ingredient)}
                  disabled={!ingredient.name || 
                    ingredient.carbs === null || 
                    ingredient.fat === null || 
                    ingredient.protein === null || 
                    ingredient.kcal === null}
                >
                  Save as Template
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div css={css`
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
          
          @media (max-width: 480px) {
            flex-direction: column;
          }
        `}>
          <button type="button" css={css`
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.2s;
            background-color: #007bff;
            color: white;
            flex: 1;
            
            &:hover {
              background-color: #0056b3;
            }
          `} onClick={addIngredient}>
            + Add New Ingredient
          </button>
          
          <div css={css`
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            flex: 1;
          `}>
            <span css={css`
              font-size: 0.875rem;
              color: #666;
              font-weight: 500;
              text-align: center;
            `}>Or add from template:</span>
            <select
              css={css`
                padding: 0.75rem 1.5rem;
                border: 1px solid #007bff;
                border-radius: 4px;
                font-size: 1rem;
                background-color: white;
                color: #007bff;
                cursor: pointer;
                transition: all 0.2s;
                
                &:hover {
                  background-color: #007bff;
                  color: white;
                }
                
                &:focus {
                  outline: none;
                  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
                }
              `}
              onChange={(e) => {
                const template = ingredientTemplates.find(t => t.name === e.target.value);
                if (template) {
                  addIngredientFromTemplate(template);
                  e.target.value = ''; // Reset selection
                }
              }}
              value=""
            >
              <option value="">Select template...</option>
              {ingredientTemplates.map(template => (
                <option key={template.id || template.name} value={template.name}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
        </div>
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
          {initialData ? 'Update Meal' : 'Add Meal'}
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
