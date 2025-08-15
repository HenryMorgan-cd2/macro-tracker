/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from 'react';
import { css } from '@emotion/react';
import { DailyTargets } from '../types';
import { Button } from './Button';
import { NumberField } from './NumberField';

interface DailyTargetsManagerProps {
  targets: DailyTargets | null;
  onSave: (targets: DailyTargets) => void;
  onReset: () => void;
}

export const DailyTargetsManager: React.FC<DailyTargetsManagerProps> = ({ 
  targets, 
  onSave, 
  onReset 
}) => {
  const [localTargets, setLocalTargets] = useState<DailyTargets>({
    carbs: { min: undefined, max: undefined },
    fat: { min: undefined, max: undefined },
    protein: { min: undefined, max: undefined },
    kcal: { min: undefined, max: undefined }
  });

  useEffect(() => {
    if (targets) {
      setLocalTargets({
        carbs: { min: targets.carbs?.min, max: targets.carbs?.max },
        fat: { min: targets.fat?.min, max: targets.fat?.max },
        protein: { min: targets.protein?.min, max: targets.protein?.max },
        kcal: { min: targets.kcal?.min, max: targets.kcal?.max }
      });
    }
  }, [targets]);

  const handleSave = () => {
    // Filter out undefined values
    const cleanTargets: DailyTargets = {};
    
    Object.entries(localTargets).forEach(([macro, values]) => {
      if (values?.min !== undefined || values?.max !== undefined) {
        cleanTargets[macro as keyof DailyTargets] = {
          min: values.min,
          max: values.max
        };
      }
    });
    
    onSave(cleanTargets);
  };

  const handleReset = () => {
    setLocalTargets({
      carbs: { min: undefined, max: undefined },
      fat: { min: undefined, max: undefined },
      protein: { min: undefined, max: undefined },
      kcal: { min: undefined, max: undefined }
    });
    onReset();
  };

  const updateTarget = (macro: keyof DailyTargets, field: 'min' | 'max', value: number | undefined) => {
    setLocalTargets(prev => ({
      ...prev,
      [macro]: {
        ...prev[macro],
        [field]: value
      }
    }));
  };

  const renderMacroInputs = (macro: keyof DailyTargets, label: string, unit: string) => {
    const values = localTargets[macro];
    
    return (
      <div css={css`
        background: white;
        padding: 1.5rem;
        border-radius: var(--border-radius);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        margin-bottom: 1rem;
      `}>
        <h3 css={css`
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 1rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        `}>
          {label}
          <span css={css`
            font-size: 0.875rem;
            font-weight: 400;
            color: #666;
          `}>
            ({unit})
          </span>
        </h3>
        
        <div css={css`
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          
          @media (max-width: 768px) {
            grid-template-columns: 1fr;
          }
        `}>
          <div>
            <label css={css`
              display: block;
              font-weight: 600;
              color: #555;
              margin-bottom: 0.5rem;
              font-size: 0.875rem;
            `}>
              Minimum {label}
            </label>
            <NumberField
              value={values?.min}
              onChange={(value) => updateTarget(macro, 'min', value)}
              placeholder="No minimum"
              min={0}
              step={0.1}
            />
          </div>
          
          <div>
            <label css={css`
              display: block;
              font-weight: 600;
              color: #555;
              margin-bottom: 0.5rem;
              font-size: 0.875rem;
            `}>
              Maximum {label}
            </label>
            <NumberField
              value={values?.max}
              onChange={(value) => updateTarget(macro, 'max', value)}
              placeholder="No maximum"
              min={0}
              step={0.1}
            />
          </div>
        </div>
        
        <div css={css`
          margin-top: 1rem;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          color: #666;
        `}>
          {values?.min !== undefined && values?.max !== undefined ? (
            `Target: ${values.min} - ${values.max} ${unit}`
          ) : values?.min !== undefined ? (
            `Minimum: ${values.min} ${unit}`
          ) : values?.max !== undefined ? (
            `Maximum: ${values.max} ${unit}`
          ) : (
            'No targets set'
          )}
        </div>
      </div>
    );
  };

  return (
    <div css={css`
      max-width: var(--container-max-width);
      margin: 0 auto;
      padding: var(--container-padding);
    `}>
      <div css={css`
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: clamp(1.5rem, 5vw, 2rem);
        border-radius: var(--border-radius);
        margin-bottom: 2rem;
        text-align: center;
      `}>
        <h1 css={css`
          font-size: clamp(1.5rem, 5vw, 2rem);
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        `}>
          Daily Macro Targets
        </h1>
        <p css={css`
          font-size: clamp(1rem, 3vw, 1.1rem);
          opacity: 0.9;
          margin: 0;
        `}>
          Set your daily targets for each macro. Leave fields empty if you don't want to track that limit.
        </p>
      </div>

      <div css={css`
        margin-bottom: 2rem;
      `}>
        {renderMacroInputs('kcal', 'Calories', 'kcal')}
        {renderMacroInputs('carbs', 'Carbohydrates', 'g')}
        {renderMacroInputs('protein', 'Protein', 'g')}
        {renderMacroInputs('fat', 'Fat', 'g')}
      </div>

      <div css={css`
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      `}>
        <Button
          buttonStyle="solid"
          color="#28a745"
          size="large"
          onClick={handleSave}
        >
          Save Targets
        </Button>
        
        <Button
          buttonStyle="outline"
          color="#6c757d"
          size="large"
          onClick={handleReset}
        >
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
};
