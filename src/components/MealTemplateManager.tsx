/** @jsxImportSource @emotion/react */
import React, { useState } from 'react';
import { css } from '@emotion/react';
import { MealTemplate, IngredientTemplate } from '../types';
import { Button } from './Button';

interface MealTemplateManagerProps {
  templates: MealTemplate[];
  ingredientTemplates: IngredientTemplate[];
  onSaveTemplate: (template: Omit<MealTemplate, 'id'>) => void;
  onUpdateTemplate: (id: number, template: Omit<MealTemplate, 'id'>) => void;
  onDeleteTemplate: (id: number) => void;
  onUseTemplate: (template: MealTemplate) => void;
  onClose: () => void;
}

interface EditableTemplate extends Omit<MealTemplate, 'id' | 'ingredients'> {
  key: string;
  ingredients: Array<{
    id: number;
    quantity: number;
  }>; // Array of ingredient template IDs with quantities
}

export const MealTemplateManager: React.FC<MealTemplateManagerProps> = ({
  templates,
  ingredientTemplates,
  onSaveTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onUseTemplate,
  onClose
}) => {
  const [editingTemplate, setEditingTemplate] = useState<EditableTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<EditableTemplate>({
    key: 'new',
    name: '',
    description: '',
    ingredients: [],
  });

  const handleNewTemplateChange = (field: keyof EditableTemplate, value: string | Array<{id: number, quantity: number}>) => {
    setNewTemplate(prev => ({ ...prev, [field]: value }));
  };

  const handleEditingTemplateChange = (field: keyof EditableTemplate, value: string | Array<{id: number, quantity: number}>) => {
    if (editingTemplate) {
      setEditingTemplate(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const saveNewTemplate = () => {
    if (newTemplate.name && newTemplate.ingredients.length > 0) {
      const ingredients = ingredientTemplates.filter(it => 
        newTemplate.ingredients.some(ing => ing.id === it.id)
      ).map(it => ({
        ...it,
        quantity: newTemplate.ingredients.find(ing => ing.id === it.id)?.quantity || 1
      }));
      
      onSaveTemplate({
        name: newTemplate.name,
        description: newTemplate.description,
        ingredients: ingredients,
      });
      
      setNewTemplate({
        key: 'new',
        name: '',
        description: '',
        ingredients: [],
      });
    }
  };

  const saveEditingTemplate = () => {
    if (editingTemplate && 
        editingTemplate.name && 
        editingTemplate.ingredients.length > 0) {
      const ingredients = ingredientTemplates.filter(it => 
        editingTemplate.ingredients.some(ing => ing.id === it.id)
      ).map(it => ({
        ...it,
        quantity: editingTemplate.ingredients.find(ing => ing.id === it.id)?.quantity || 1
      }));
      
      // Find the template ID from the templates array
      const template = templates.find(t => t.name === editingTemplate.name);
      if (template?.id) {
        onUpdateTemplate(template.id, {
          name: editingTemplate.name,
          description: editingTemplate.description,
          ingredients: ingredients,
        });
        setEditingTemplate(null);
      }
    }
  };

  const startEditing = (template: MealTemplate) => {
    setEditingTemplate({
      key: `edit-${template.id}`,
      name: template.name,
      description: template.description || '',
      ingredients: template.ingredients.map(i => ({ id: i.id!, quantity: i.quantity || 1 })),
    });
  };

  const cancelEditing = () => {
    setEditingTemplate(null);
  };

  const toggleIngredient = (ingredientId: number, isNew: boolean) => {
    if (isNew) {
      const newIngredients = newTemplate.ingredients.some(ing => ing.id === ingredientId)
        ? newTemplate.ingredients.filter(id => id.id !== ingredientId)
        : [...newTemplate.ingredients, { id: ingredientId, quantity: 1 }];
      handleNewTemplateChange('ingredients', newIngredients);
    } else if (editingTemplate) {
      const newIngredients = editingTemplate.ingredients.some(ing => ing.id === ingredientId)
        ? editingTemplate.ingredients.filter(id => id.id !== ingredientId)
        : [...editingTemplate.ingredients, { id: ingredientId, quantity: 1 }];
      handleEditingTemplateChange('ingredients', newIngredients);
    }
  };

  const getTotalMacros = (ingredients: Array<{id: number, quantity: number}>) => {
    return ingredients.reduce((acc, ing) => {
      const template = ingredientTemplates.find(it => it.id === ing.id);
      if (template) {
        return {
          carbs: acc.carbs + (template.carbs * ing.quantity),
          fat: acc.fat + (template.fat * ing.quantity),
          protein: acc.protein + (template.protein * ing.quantity),
          kcal: acc.kcal + (template.kcal * ing.quantity),
        };
      }
      return acc;
    }, { carbs: 0, fat: 0, protein: 0, kcal: 0 });
  };

  return (
    <div>
      {/* Add New Template Section */}
      <div css={css`
        background: #f8f9fa;
        padding: clamp(1rem, 4vw, 1.5rem);
        border-radius: var(--border-radius);
        margin-bottom: clamp(1.5rem, 5vw, 2rem);
      `}>
        <h3 css={css`
          margin: 0 0 1rem 0;
          color: #333;
        `}>Create New Meal Template</h3>
        
        <div css={css`
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--grid-gap);
          align-items: end;
          margin-bottom: 1rem;
        `}>
          <div>
            <label css={css`
              display: block;
              margin-bottom: 0.5rem;
              font-weight: 600;
              color: #333;
            `}>Template Name</label>
            <input
              css={css`
                width: 100%;
                padding: 0.5rem;
                border: 1px solid #ddd;
                border-radius: var(--border-radius);
                font-size: 0.875rem;
                
                &:focus {
                  outline: none;
                  border-color: #007bff;
                  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
                }
              `}
              type="text"
              placeholder="e.g., Protein Bowl, Quick Breakfast"
              value={newTemplate.name}
              onChange={(e) => handleNewTemplateChange('name', e.target.value)}
            />
          </div>
          
          <div>
            <label css={css`
              display: block;
              margin-bottom: 0.5rem;
              font-weight: 600;
              color: #333;
            `}>Description (Optional)</label>
            <input
              css={css`
                width: 100%;
                padding: 0.5rem;
                border: 1px solid #ddd;
                border-radius: var(--border-radius);
                font-size: 0.875rem;
                
                &:focus {
                  outline: none;
                  border-color: #007bff;
                  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
                }
              `}
              type="text"
              placeholder="e.g., High protein meal for post-workout"
              value={newTemplate.description}
              onChange={(e) => handleNewTemplateChange('description', e.target.value)}
            />
          </div>
          
          <Button
            buttonStyle="solid"
            color="#28a745"
            size="regular"
            onClick={saveNewTemplate}
            disabled={!newTemplate.name || newTemplate.ingredients.length === 0}
          >
            Create Template
          </Button>
        </div>

        {/* Ingredient Selection */}
        <div>
          <label css={css`
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #333;
          `}>Select Ingredients</label>
          <div css={css`
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 0.5rem;
            max-height: 200px;
            overflow-y: auto;
            border: 1px solid #ddd;
            border-radius: var(--border-radius);
            padding: 0.5rem;
            background: white;
          `}>
            {ingredientTemplates.map((ingredient) => {
              const isSelected = newTemplate.ingredients.some(ing => ing.id === ingredient.id);
              const selectedIngredient = newTemplate.ingredients.find(ing => ing.id === ingredient.id);
              
              return (
                <div key={ingredient.id} css={css`
                  display: flex;
                  align-items: center;
                  gap: 0.5rem;
                  padding: 0.5rem;
                  border: 1px solid ${isSelected ? '#007bff' : '#ddd'};
                  border-radius: var(--border-radius);
                  background: ${isSelected ? '#f8f9ff' : 'white'};
                  cursor: pointer;
                  font-size: 0.875rem;
                  
                  &:hover {
                    background: ${isSelected ? '#f0f4ff' : '#f8f9fa'};
                  }
                `}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleIngredient(ingredient.id!, true)}
                  />
                  <span css={css`flex: 1;`}>{ingredient.name}</span>
                  <span css={css`color: #666; font-size: 0.75rem;`}>
                    ({ingredient.carbs}g C, {ingredient.fat}g F, {ingredient.protein}g P)
                  </span>
                  {isSelected && (
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={selectedIngredient?.quantity || 1}
                      onChange={(e) => {
                        const newIngredients = newTemplate.ingredients.map(ing => 
                          ing.id === ingredient.id 
                            ? { ...ing, quantity: parseFloat(e.target.value) || 1 }
                            : ing
                        );
                        handleNewTemplateChange('ingredients', newIngredients);
                      }}
                      css={css`
                        width: 60px;
                        padding: 0.25rem;
                        border: 1px solid #ddd;
                        border-radius: var(--border-radius);
                        font-size: 0.75rem;
                        text-align: center;
                        
                        &:focus {
                          outline: none;
                          border-color: #007bff;
                        }
                      `}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Macro Totals */}
        {newTemplate.ingredients.length > 0 && (
          <div css={css`
            margin-top: 1rem;
            padding: 0.75rem;
            background: #e9ecef;
            border-radius: 4px;
            font-size: 0.875rem;
          `}>
            <strong>Total Macros:</strong> {getTotalMacros(newTemplate.ingredients).carbs.toFixed(1)}g carbs, 
            {getTotalMacros(newTemplate.ingredients).fat.toFixed(1)}g fat, 
            {getTotalMacros(newTemplate.ingredients).protein.toFixed(1)}g protein, 
            {getTotalMacros(newTemplate.ingredients).kcal.toFixed(1)} kcal
          </div>
        )}
      </div>

      {/* Templates List */}
      <div>
        <h3 css={css`
          margin: 0 0 1rem 0;
          color: #333;
        `}>Existing Meal Templates</h3>
        
        {templates.length === 0 ? (
          <div css={css`
            text-align: center;
            padding: 2rem;
            color: #666;
            background: #f8f9fa;
            border-radius: 8px;
          `}>
            No meal templates yet. Create your first one above!
          </div>
        ) : (
          <div css={css`
            display: flex;
            flex-direction: column;
            gap: 1rem;
          `}>
            {templates.map((template) => {
              const isEditing = editingTemplate?.key === `edit-${template.id}`;
              
              return (
                <div key={template.id} css={css`
                  background: white;
                  border: 1px solid #e9ecef;
                  border-radius: 8px;
                  padding: 1rem;
                `}>
                  {isEditing ? (
                    <div>
                      <div css={css`
                        display: grid;
                        grid-template-columns: 2fr 2fr auto;
                        gap: 1rem;
                        align-items: end;
                        margin-bottom: 1rem;
                      `}>
                        <div>
                          <label css={css`
                            display: block;
                            margin-bottom: 0.5rem;
                            font-weight: 600;
                            color: #333;
                          `}>Template Name</label>
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
                            value={editingTemplate.name}
                            onChange={(e) => handleEditingTemplateChange('name', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label css={css`
                            display: block;
                            margin-bottom: 0.5rem;
                            font-weight: 600;
                            color: #333;
                          `}>Description</label>
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
                            value={editingTemplate.description}
                            onChange={(e) => handleEditingTemplateChange('description', e.target.value)}
                          />
                        </div>
                        
                        <div css={css`
                          display: flex;
                          gap: 0.5rem;
                        `}>
                          <Button
                            buttonStyle="solid"
                            color="#28a745"
                            size="regular"
                            onClick={saveEditingTemplate}
                          >
                            Save
                          </Button>
                          <Button
                            buttonStyle="solid"
                            color="#6c757d"
                            size="regular"
                            onClick={cancelEditing}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>

                      {/* Ingredient Selection for Editing */}
                      <div>
                        <label css={css`
                          display: block;
                          margin-bottom: 0.5rem;
                          font-weight: 600;
                          color: #333;
                        `}>Select Ingredients</label>
                        <div css={css`
                          display: grid;
                          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                          gap: 0.5rem;
                          max-height: 200px;
                          overflow-y: auto;
                          border: 1px solid #ddd;
                          border-radius: 4px;
                          padding: 0.5rem;
                          background: #f8f9fa;
                        `}>
                          {ingredientTemplates.map((ingredient) => {
                            const isSelected = editingTemplate.ingredients.some(ing => ing.id === ingredient.id);
                            const selectedIngredient = editingTemplate.ingredients.find(ing => ing.id === ingredient.id);
                            
                            return (
                              <label key={ingredient.id} css={css`
                                display: flex;
                                align-items: center;
                                gap: 0.5rem;
                                padding: 0.25rem;
                                cursor: pointer;
                                font-size: 0.875rem;
                                
                                &:hover {
                                  background: #e9ecef;
                                }
                              `}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleIngredient(ingredient.id!, false)}
                                />
                                <span css={css`flex: 1;`}>{ingredient.name}</span>
                                <span css={css`color: #666; font-size: 0.75rem;`}>
                                  ({ingredient.carbs}g C, {ingredient.fat}g F, {ingredient.protein}g P)
                                </span>
                                {isSelected && (
                                  <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={selectedIngredient?.quantity || 1}
                                    onChange={(e) => {
                                      const newIngredients = editingTemplate.ingredients.map(ing => 
                                        ing.id === ingredient.id 
                                          ? { ...ing, quantity: parseFloat(e.target.value) || 1 }
                                          : ing
                                      );
                                      handleEditingTemplateChange('ingredients', newIngredients);
                                    }}
                                    css={css`
                                      width: 60px;
                                      padding: 0.25rem;
                                      border: 1px solid #ddd;
                                      border-radius: 2px;
                                      font-size: 0.75rem;
                                      text-align: center;
                                      
                                      &:focus {
                                        outline: none;
                                        border-color: #007bff;
                                      }
                                    `}
                                  />
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div css={css`
                        display: grid;
                        grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr auto;
                        gap: 1rem;
                        align-items: center;
                        margin-bottom: 0.5rem;
                      `}>
                        <div>
                          <div css={css`
                            font-weight: 600;
                            color: #333;
                          `}>{template.name}</div>
                          {template.description && (
                            <div css={css`
                              font-size: 0.75rem;
                              color: #666;
                              margin-top: 0.25rem;
                            `}>{template.description}</div>
                          )}
                        </div>
                        <div css={css`text-align: center;`}>
                          {template.ingredients.length} ingredients
                        </div>
                                                  <div css={css`text-align: center;`}>
                            {getTotalMacros(template.ingredients.map(ing => ({ id: ing.id!, quantity: ing.quantity || 1 }))).carbs.toFixed(1)}g
                          </div>
                          <div css={css`text-align: center;`}>
                            {getTotalMacros(template.ingredients.map(ing => ({ id: ing.id!, quantity: ing.quantity || 1 }))).fat.toFixed(1)}g
                          </div>
                          <div css={css`text-align: center;`}>
                            {getTotalMacros(template.ingredients.map(ing => ({ id: ing.id!, quantity: ing.quantity || 1 }))).protein.toFixed(1)}g
                          </div>
                        <div css={css`
                          display: flex;
                          gap: 0.5rem;
                        `}>
                          <Button
                            buttonStyle="solid"
                            color="#007bff"
                            size="regular"
                            onClick={() => onUseTemplate(template)}
                          >
                            Use
                          </Button>
                          <Button
                            buttonStyle="solid"
                            color="#ffc107"
                            size="regular"
                            onClick={() => startEditing(template)}
                          >
                            Edit
                          </Button>
                          <Button
                            buttonStyle="solid"
                            color="#dc3545"
                            size="regular"
                            onClick={() => template.id && onDeleteTemplate(template.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      
                      {/* Ingredient List */}
                      <div css={css`
                        font-size: 0.875rem;
                        color: #666;
                      `}>
                        <strong>Ingredients:</strong> {template.ingredients.map(ing => `${ing.name} (${ing.quantity})`).join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
