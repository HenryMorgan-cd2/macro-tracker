/** @jsxImportSource @emotion/react */
import React, { useState } from 'react';
import { css } from '@emotion/react';
import { IngredientTemplate } from '../types';
import { NumberField } from './NumberField';
import { Button } from './Button';

interface IngredientTemplateManagerProps {
  templates: IngredientTemplate[];
  onSaveTemplate: (template: Omit<IngredientTemplate, 'id'>) => void;
  onUpdateTemplate: (id: number, template: Omit<IngredientTemplate, 'id'>) => void;
  onDeleteTemplate: (id: number) => void;
  onClose: () => void;
}

interface EditableTemplate extends Omit<IngredientTemplate, 'carbs' | 'fat' | 'protein' | 'kcal'> {
  key: string;
  carbs: number | null;
  fat: number | null;
  protein: number | null;
  kcal: number | null;
  macroUnit: 'per_unit' | 'per_100g';
}

export const IngredientTemplateManager: React.FC<IngredientTemplateManagerProps> = ({
  templates,
  onSaveTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onClose
}) => {
  const [editingTemplate, setEditingTemplate] = useState<EditableTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<EditableTemplate>({
    key: 'new',
    name: '',
    carbs: null,
    fat: null,
    protein: null,
    kcal: null,
    macroUnit: 'per_unit',
  });

  const handleNewTemplateChange = (field: keyof EditableTemplate, value: string | number | null) => {
    setNewTemplate(prev => ({ ...prev, [field]: value }));
  };

  const handleEditingTemplateChange = (field: keyof EditableTemplate, value: string | number | null) => {
    if (editingTemplate) {
      setEditingTemplate(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const saveNewTemplate = () => {
    if (newTemplate.name && 
        newTemplate.carbs !== null && 
        newTemplate.fat !== null && 
        newTemplate.protein !== null && 
        newTemplate.kcal !== null) {
      onSaveTemplate({
        name: newTemplate.name,
        carbs: newTemplate.carbs,
        fat: newTemplate.fat,
        protein: newTemplate.protein,
        kcal: newTemplate.kcal,
        macroUnit: newTemplate.macroUnit,
      });
      setNewTemplate({
        key: 'new',
        name: '',
        carbs: null,
        fat: null,
        protein: null,
        kcal: null,
        macroUnit: 'per_unit',
      });
    }
  };

  const saveEditingTemplate = () => {
    if (editingTemplate && 
        editingTemplate.name && 
        editingTemplate.carbs !== null && 
        editingTemplate.fat !== null && 
        editingTemplate.protein !== null && 
        editingTemplate.kcal !== null) {
      // Find the template ID from the templates array
      const template = templates.find(t => t.name === editingTemplate.name);
      if (template?.id) {
        onUpdateTemplate(template.id, {
          name: editingTemplate.name,
          carbs: editingTemplate.carbs,
          fat: editingTemplate.fat,
          protein: editingTemplate.protein,
          kcal: editingTemplate.kcal,
          macroUnit: editingTemplate.macroUnit,
        });
        setEditingTemplate(null);
      }
    }
  };

  const startEditing = (template: IngredientTemplate) => {
    setEditingTemplate({
      key: `edit-${template.id}`,
      id: template.id,
      name: template.name,
      carbs: template.carbs,
      fat: template.fat,
      protein: template.protein,
      kcal: template.kcal,
      macroUnit: template.macroUnit,
    });
  };

  const cancelEditing = () => {
    setEditingTemplate(null);
  };

  return (
    <div>
      {/* Add New Template Section */}
      <div css={css`
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 2rem;
      `}>
        <h3 css={css`
          margin: 0 0 1rem 0;
          color: #333;
        `}>Add New Template</h3>
        <div css={css`
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr auto;
          gap: 1rem;
          align-items: end;
        `}>
          <div>
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
              placeholder="e.g., Bell Pepper"
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
            `}>Macro Unit</label>
            <select
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
              value={newTemplate.macroUnit}
              onChange={(e) => handleNewTemplateChange('macroUnit', e.target.value as 'per_unit' | 'per_100g')}
            >
              <option value="per_100g">Per 100g</option>
              <option value="per_unit">Per Unit</option>
            </select>
          </div>
          
          <NumberField
            label={`Carbs ${newTemplate.macroUnit === 'per_100g' ? 'per 100g' : 'per unit'}`}
            value={newTemplate.carbs}
            onChange={(value) => handleNewTemplateChange('carbs', value)}
            placeholder="0"
            step={0.1}
            min={0}
          />
          
          <NumberField
            label={`Fat ${newTemplate.macroUnit === 'per_100g' ? 'per 100g' : 'per unit'}`}
            value={newTemplate.fat}
            onChange={(value) => handleNewTemplateChange('fat', value)}
            placeholder="0"
            step={0.1}
            min={0}
          />
          
          <NumberField
            label={`Protein ${newTemplate.macroUnit === 'per_100g' ? 'per 100g' : 'per unit'}`}
            value={newTemplate.protein}
            onChange={(value) => handleNewTemplateChange('protein', value)}
            placeholder="0"
            step={0.1}
            min={0}
          />
          
          <NumberField
            label={`Calories ${newTemplate.macroUnit === 'per_100g' ? 'per 100g' : 'per unit'}`}
            value={newTemplate.kcal}
            onChange={(value) => handleNewTemplateChange('kcal', value)}
            placeholder="0"
            step={0.1}
            min={0}
          />
          
          <Button
            buttonStyle="solid"
            color="#28a745"
            size="regular"
            onClick={saveNewTemplate}
          >
            Add Template
          </Button>
        </div>
      </div>

      {/* Templates List */}
      <div>
        <h3 css={css`
          margin: 0 0 1rem 0;
          color: #333;
        `}>Existing Templates</h3>
        
        {templates.length === 0 ? (
          <div css={css`
            text-align: center;
            padding: 2rem;
            color: #666;
            background: #f8f9fa;
            border-radius: 8px;
          `}>
            No ingredient templates yet. Add your first one above!
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
                    <div css={css`
                      display: grid;
                      grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr auto;
                      gap: 1rem;
                      align-items: end;
                    `}>
                      <div>
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
                        `}>Macro Unit</label>
                        <select
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
                          value={editingTemplate.macroUnit}
                          onChange={(e) => handleEditingTemplateChange('macroUnit', e.target.value as 'per_unit' | 'per_100g')}
                        >
                          <option value="per_100g">Per 100g</option>
                          <option value="per_unit">Per Unit</option>
                        </select>
                      </div>
                      
                      <NumberField
                        label={`Carbs ${editingTemplate.macroUnit === 'per_100g' ? 'per 100g' : 'per unit'}`}
                        value={editingTemplate.carbs}
                        onChange={(value) => handleEditingTemplateChange('carbs', value)}
                        placeholder="0"
                        step={0.1}
                        min={0}
                      />
                      
                      <NumberField
                        label={`Fat ${editingTemplate.macroUnit === 'per_100g' ? 'per 100g' : 'per unit'}`}
                        value={editingTemplate.fat}
                        onChange={(value) => handleEditingTemplateChange('fat', value)}
                        placeholder="0"
                        step={0.1}
                        min={0}
                      />
                      
                      <NumberField
                        label={`Protein ${editingTemplate.macroUnit === 'per_100g' ? 'per 100g' : 'per unit'}`}
                        value={editingTemplate.protein}
                        onChange={(value) => handleEditingTemplateChange('protein', value)}
                        placeholder="0"
                        step={0.1}
                        min={0}
                      />
                      
                      <NumberField
                        label={`Calories ${editingTemplate.macroUnit === 'per_100g' ? 'per 100g' : 'per unit'}`}
                        value={editingTemplate.kcal}
                        onChange={(value) => handleEditingTemplateChange('kcal', value)}
                        placeholder="0"
                        step={0.1}
                        min={0}
                      />
                      
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
                  ) : (
                    <div css={css`
                      display: grid;
                      grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr auto;
                      gap: 1rem;
                      align-items: center;
                    `}>
                      <div css={css`
                        font-weight: 600;
                        color: #333;
                      `}>{template.name}</div>
                      <div css={css`text-align: center;`}>{template.macroUnit === 'per_100g' ? 'Per 100g' : 'Per Unit'}</div>
                      <div css={css`text-align: center;`}>{template.carbs}g</div>
                      <div css={css`text-align: center;`}>{template.fat}g</div>
                      <div css={css`text-align: center;`}>{template.protein}g</div>
                      <div css={css`text-align: center;`}>{template.kcal}</div>
                      <div css={css`
                        display: flex;
                        gap: 0.5rem;
                      `}>
                        <Button
                          buttonStyle="solid"
                          color="#007bff"
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
