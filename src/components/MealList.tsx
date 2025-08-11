/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import { Meal, DailyTargets } from '../types';
import { Button } from './Button';
import { calculateMacroProgress, getProgressColor, getProgressText, getProgressBarWidth, shouldShowOverflowIndicator } from '../utils/macroProgress';

interface MealListProps {
  meals: Meal[];
  dailyTargets?: DailyTargets | null;
  onEdit: (meal: Meal) => void;
  onDelete: (id: number) => void;
  onDuplicate: (meal: Meal) => void;
}

interface DayGroup {
  date: string;
  dateLabel: string;
  meals: Meal[];
  totals: {
    carbs: number;
    fat: number;
    protein: number;
    kcal: number;
  };
}

export const MealList: React.FC<MealListProps> = ({ 
  meals, 
  dailyTargets, 
  onEdit, 
  onDelete, 
  onDuplicate 
}) => {
  const calculateTotals = (ingredients: Meal['ingredients']) => {
    return ingredients.reduce(
      (totals, ingredient) => {
        let actualCarbs, actualFat, actualProtein, actualKcal;
        
        if (ingredient.macroUnit === 'per_100g' && ingredient.quantity > 0) {
          // For per_100g, scale the macros based on quantity
          const multiplier = ingredient.quantity / 100;
          actualCarbs = ingredient.carbs * multiplier;
          actualFat = ingredient.fat * multiplier;
          actualProtein = ingredient.protein * multiplier;
          actualKcal = ingredient.kcal * multiplier;
        } else {
          // For per_unit, use as-is
          actualCarbs = ingredient.carbs;
          actualFat = ingredient.fat;
          actualProtein = ingredient.protein;
          actualKcal = ingredient.kcal;
        }
        
        return {
          carbs: totals.carbs + actualCarbs,
          fat: totals.fat + actualFat,
          protein: totals.protein + actualProtein,
          kcal: totals.kcal + actualKcal,
        };
      },
      { carbs: 0, fat: 0, protein: 0, kcal: 0 }
    );
  };

  const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (datetime: string) => {
    const date = new Date(datetime);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const groupMealsByDay = (meals: Meal[]): DayGroup[] => {
    const groups: { [key: string]: DayGroup } = {};

    meals.forEach(meal => {
      const date = new Date(meal.datetime);
      const dateKey = date.toDateString();
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: dateKey,
          dateLabel: formatDate(meal.datetime),
          meals: [],
          totals: { carbs: 0, fat: 0, protein: 0, kcal: 0 }
        };
      }

      const mealTotals = calculateTotals(meal.ingredients);
      groups[dateKey].meals.push(meal);
      groups[dateKey].totals.carbs += mealTotals.carbs;
      groups[dateKey].totals.fat += mealTotals.fat;
      groups[dateKey].totals.protein += mealTotals.protein;
      groups[dateKey].totals.kcal += mealTotals.kcal;

      // Sort meals in a day by newest at the top
      groups[dateKey].meals.sort((a, b) => 
        new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
      );
    });

    return Object.values(groups).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const renderMacroCard = (macro: keyof DailyTargets, label: string, value: number, unit: string, targets?: DailyTargets[keyof DailyTargets]) => {
    // Type guard to ensure targets has the correct structure
    const hasTargets = targets && typeof targets === 'object' && 'min' in targets && 'max' in targets;
    
    // Convert to the expected type for progress calculation
    const progressTargets = hasTargets ? { min: targets.min, max: targets.max } : undefined;
    const progress = calculateMacroProgress(value, progressTargets);
    const progressColor = getProgressColor(progress.status);
    const progressText = getProgressText(progress.status, label);
    
    return (
      <div css={css`
        text-align: center;
        background: rgba(255, 255, 255, 0.25);
        padding: clamp(0.75rem, 3vw, 1rem);
        border-radius: var(--border-radius);
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      `}>
        <span css={css`
          display: block;
          font-size: clamp(0.75rem, 2.5vw, 0.875rem);
          opacity: 1;
          margin-bottom: 0.25rem;
          font-weight: 700;
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        `}>{label}</span>
        
        <span css={css`
          display: block;
          font-size: clamp(1rem, 3.5vw, 1.25rem);
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
          color: #ffffff;
        `}>
          {macro === 'kcal' ? value.toFixed(0) : value.toFixed(1)}{unit}
        </span>
        
        {hasTargets && (
          <div css={css`
            font-size: clamp(0.65rem, 2vw, 0.75rem);
            opacity: 1;
            margin-bottom: 0.5rem;
            font-weight: 700;
            background: rgba(255, 255, 255, 0.25);
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            border: 2px solid rgba(255, 255, 255, 0.4);
            color: #ffffff;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          `}>
            {targets.min !== undefined && targets.max !== undefined ? (
              `Target: ${targets.min}-${targets.max}${unit}`
            ) : targets.min !== undefined ? (
              `Min: ${targets.min}${unit}`
            ) : targets.max !== undefined ? (
              `Max: ${targets.max}${unit}`
            ) : null}
          </div>
        )}
        
        {progress.status !== 'no_target' && (
          <div css={css`
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 0.5rem;
            position: relative;
            border: 1px solid rgba(255, 255, 255, 0.2);
          `}>
            <div css={css`
              height: 100%;
              width: ${getProgressBarWidth(progress.percentage)}%;
              background: ${progressColor};
              transition: width 0.3s ease;
            `} />
            {shouldShowOverflowIndicator(progress.percentage) && (
              <div css={css`
                position: absolute;
                right: 0;
                top: 0;
                height: 100%;
                width: 2px;
                background: ${progressColor};
                opacity: 0.8;
              `} />
            )}
          </div>
        )}
        
        <div css={css`
          font-size: clamp(0.6rem, 1.8vw, 0.7rem);
          opacity: 1;
          color: ${progressColor};
          font-weight: 700;
          text-align: center;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        `}>
          {progressText}
        </div>
      </div>
    );
  };

  const dayGroups = groupMealsByDay(meals);

  if (meals.length === 0) {
    return (
      <div css={css`
        max-width: var(--container-max-width);
        margin: 0 auto;
        padding: var(--container-padding);
      `}>
        <div css={css`
          text-align: center;
          padding: clamp(2rem, 6vw, 3rem);
          color: #666;
          font-size: clamp(1rem, 3vw, 1.1rem);
        `}>
          <h3>No meals yet</h3>
          <p>Add your first meal to start tracking your nutrition!</p>
        </div>
      </div>
    );
  }

  return (
    <div css={css`
      max-width: var(--container-max-width);
      margin: 0 auto;
      padding: var(--container-padding);
    `}>
      {dayGroups.map((dayGroup) => (
        <div key={dayGroup.date} css={css`
          margin-bottom: clamp(2rem, 6vw, 3rem);
        `}>
          <div css={css`
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: clamp(1rem, 4vw, 1.5rem);
            border-radius: var(--border-radius) var(--border-radius) 0 0;
            margin-bottom: 0;
          `}>
            <h2 css={css`
              font-size: clamp(1.25rem, 4vw, 1.5rem);
              font-weight: 700;
              margin: 0 0 0.5rem 0;
            `}>{dayGroup.dateLabel}</h2>
            <div css={css`
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
              gap: var(--grid-gap);
              margin-top: 1rem;
            `}>
              {renderMacroCard('kcal', 'Total Calories', dayGroup.totals.kcal, 'kcal', dailyTargets?.kcal)}
              {renderMacroCard('protein', 'Protein', dayGroup.totals.protein, 'g', dailyTargets?.protein)}
              {renderMacroCard('carbs', 'Carbs', dayGroup.totals.carbs, 'g', dailyTargets?.carbs)}
              {renderMacroCard('fat', 'Fat', dayGroup.totals.fat, 'g', dailyTargets?.fat)}
            </div>
          </div>
          
          <div css={css`
            background: white;
            border-radius: 0 0 var(--border-radius) var(--border-radius);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          `}>
            {dayGroup.meals.map((meal) => {
              const mealTotals = calculateTotals(meal.ingredients);
              
              return (
                <div key={meal.id} css={css`
                  border-bottom: 1px solid #eee;
                  
                  &:last-child {
                    border-bottom: none;
                  }
                `}>
                  <div css={css`
                    padding: clamp(1rem, 4vw, 1.5rem);
                    border-bottom: 1px solid #eee;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    
                    @media (min-width: 768px) {
                      flex-direction: row;
                      justify-content: space-between;
                      align-items: center;
                      gap: 0;
                    }
                  `}>
                    <div css={css`
                      flex: 1;
                      min-width: 0;
                    `}>
                      <h3 css={css`
                        font-size: clamp(1.1rem, 3.5vw, 1.25rem);
                        font-weight: 600;
                        color: #333;
                        margin: 0;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                      `}>{meal.name}</h3>
                      <p css={css`
                        color: #666;
                        font-size: clamp(0.8rem, 2.5vw, 0.9rem);
                        margin-top: 0.25rem;
                      `}>{formatDateTime(meal.datetime)}</p>
                    </div>
                    <div css={css`
                      display: flex;
                      flex-wrap: wrap;
                      gap: 0.5rem;
                      justify-content: center;
                      
                      @media (min-width: 768px) {
                        justify-content: flex-end;
                        flex-shrink: 0;
                      }
                    `}>
                      <Button
                        buttonStyle="solid"
                        color="#007bff"
                        size="regular"
                        onClick={() => onEdit(meal)}
                      >
                        Edit
                      </Button>
                      <Button
                        buttonStyle="solid"
                        color="#28a745"
                        size="regular"
                        onClick={() => onDuplicate(meal)}
                      >
                        Duplicate
                      </Button>
                      <Button
                        buttonStyle="solid"
                        color="#dc3545"
                        size="regular"
                        onClick={() => meal.id && onDelete(meal.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  <div css={css`
                    padding: clamp(1rem, 4vw, 1.5rem);
                  `}>
                    <h4>Ingredients</h4>
                    <div css={css`
                      display: grid;
                      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                      gap: var(--grid-gap);
                      margin-top: 1rem;
                    `}>
                      {meal.ingredients.map((ingredient, index) => (
                        <div key={index} css={css`
                          background: #f8f9fa;
                          padding: 1rem;
                          border-radius: var(--border-radius);
                          border-left: 4px solid #007bff;
                        `}>
                          <div css={css`
                            font-weight: 600;
                            color: #333;
                            margin-bottom: 0.5rem;
                            word-wrap: break-word;
                            overflow-wrap: break-word;
                          `}>
                            {ingredient.name} {ingredient.macroUnit === 'per_100g' 
                              ? `(${ingredient.quantity}g)` 
                              : ingredient.quantity > 1 
                                ? ` x ${ingredient.quantity}` 
                                : ''
                            }
                          </div>
                          <div css={css`
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
                            gap: 0.5rem;
                            font-size: clamp(0.75rem, 2.5vw, 0.875rem);
                          `}>
                            <div css={css`
                              text-align: center;
                              
                              span:first-child {
                                display: block;
                                font-weight: 600;
                                color: #666;
                              }
                              
                              span:last-child {
                                color: #333;
                              }
                            `}>
                              <span>Carbs</span>
                              <span>{(() => {
                                if (ingredient.macroUnit === 'per_100g' && ingredient.quantity > 0) {
                                  return (ingredient.carbs * ingredient.quantity / 100).toFixed(1);
                                }
                                return (ingredient.carbs * ingredient.quantity).toFixed(1);
                              })()}g</span>
                            </div>
                            <div css={css`
                              text-align: center;
                              
                              span:first-child {
                                display: block;
                                font-weight: 600;
                                color: #666;
                              }
                              
                              span:last-child {
                                color: #333;
                              }
                            `}>
                              <span>Fat</span>
                              <span>{(() => {
                                if (ingredient.macroUnit === 'per_100g' && ingredient.quantity > 0) {
                                  return (ingredient.fat * ingredient.quantity / 100).toFixed(1);
                                }
                                return (ingredient.fat * ingredient.quantity).toFixed(1);
                              })()}g</span>
                            </div>
                            <div css={css`
                              text-align: center;
                              
                              span:first-child {
                                display: block;
                                font-weight: 600;
                                color: #666;
                              }
                              
                              span:last-child {
                                color: #333;
                              }
                            `}>
                              <span>Protein</span>
                              <span>{(() => {
                                if (ingredient.macroUnit === 'per_100g' && ingredient.quantity > 0) {
                                  return (ingredient.protein * ingredient.quantity / 100).toFixed(1);
                                }
                                return (ingredient.protein * ingredient.quantity).toFixed(1);
                              })()}g</span>
                            </div>
                            <div css={css`
                              text-align: center;
                              
                              span:first-child {
                                display: block;
                                font-weight: 600;
                                color: #666;
                              }
                              
                              span:last-child {
                                color: #333;
                              }
                            `}>
                              <span>kcal</span>
                              <span>{(() => {
                                if (ingredient.macroUnit === 'per_100g' && ingredient.quantity > 0) {
                                  return (ingredient.kcal * ingredient.quantity / 100).toFixed(0);
                                }
                                return (ingredient.kcal * ingredient.quantity).toFixed(0);
                              })()}</span>
                            </div>
                          </div>
                          {ingredient.quantity > 1 && (
                            <div css={css`
                              margin-top: 0.5rem;
                              font-size: clamp(0.65rem, 2vw, 0.75rem);
                              color: #666;
                              text-align: center;
                            `}>
                              {ingredient.macroUnit === 'per_100g' 
                                ? `Per 100g: ${ingredient.carbs}g carbs, ${ingredient.fat}g fat, ${ingredient.protein}g protein, ${ingredient.kcal} kcal`
                                : `Per unit: ${ingredient.carbs}g carbs, ${ingredient.fat}g fat, ${ingredient.protein}g protein, ${ingredient.kcal} kcal`
                              }
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div css={css`
                      margin-top: 1.5rem;
                      padding-top: 1rem;
                      border-top: 2px solid #eee;
                      display: grid;
                      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                      gap: var(--grid-gap);
                    `}>
                      <div css={css`
                        text-align: center;
                        padding: clamp(0.75rem, 3vw, 1rem);
                        background: #e9ecef;
                        border-radius: var(--border-radius);
                        
                        span:first-child {
                          display: block;
                          font-weight: 600;
                          color: #666;
                          font-size: clamp(0.75rem, 2.5vw, 0.875rem);
                        }
                        
                        span:last-child {
                          display: block;
                          font-size: clamp(1rem, 3.5vw, 1.25rem);
                          font-weight: 700;
                          color: #333;
                        }
                      `}>
                        <span>Total Carbs</span>
                        <span>{mealTotals.carbs.toFixed(1)}g</span>
                      </div>
                      <div css={css`
                        text-align: center;
                        padding: clamp(0.75rem, 3vw, 1rem);
                        background: #e9ecef;
                        border-radius: var(--border-radius);
                        
                        span:first-child {
                          display: block;
                          font-weight: 600;
                          color: #666;
                          font-size: clamp(0.75rem, 2.5vw, 0.875rem);
                        }
                        
                        span:last-child {
                          display: block;
                          font-size: clamp(1rem, 3.5vw, 1.25rem);
                          font-weight: 700;
                          color: #333;
                        }
                      `}>
                        <span>Total Fat</span>
                        <span>{mealTotals.fat.toFixed(1)}g</span>
                      </div>
                      <div css={css`
                        text-align: center;
                        padding: clamp(0.75rem, 3vw, 1rem);
                        background: #e9ecef;
                        border-radius: var(--border-radius);
                        
                        span:first-child {
                          display: block;
                          font-weight: 600;
                          color: #666;
                          font-size: clamp(0.75rem, 2.5vw, 0.875rem);
                        }
                        
                        span:last-child {
                          display: block;
                          font-size: clamp(1rem, 3.5vw, 1.25rem);
                          font-weight: 700;
                          color: #333;
                        }
                      `}>
                        <span>Total Protein</span>
                        <span>{mealTotals.protein.toFixed(1)}g</span>
                      </div>
                      <div css={css`
                        text-align: center;
                        padding: clamp(0.75rem, 3vw, 1rem);
                        background: #e9ecef;
                        border-radius: var(--border-radius);
                        
                        span:first-child {
                          display: block;
                          font-weight: 600;
                          color: #666;
                          font-size: clamp(0.75rem, 2.5vw, 0.875rem);
                        }
                        
                        span:last-child {
                          display: block;
                          font-size: clamp(1rem, 3.5vw, 1.25rem);
                          font-weight: 700;
                          color: #333;
                        }
                      `}>
                        <span>Total kcal</span>
                        <span>{mealTotals.kcal.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};


