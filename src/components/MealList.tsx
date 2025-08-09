/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import { Meal } from '../types';

interface MealListProps {
  meals: Meal[];
  onEdit: (meal: Meal) => void;
  onDelete: (id: number) => void;
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

export const MealList: React.FC<MealListProps> = ({ meals, onEdit, onDelete }) => {
  const calculateTotals = (ingredients: Meal['ingredients']) => {
    return ingredients.reduce(
      (totals, ingredient) => ({
        carbs: totals.carbs + (ingredient.carbs * ingredient.quantity),
        fat: totals.fat + (ingredient.fat * ingredient.quantity),
        protein: totals.protein + (ingredient.protein * ingredient.quantity),
        kcal: totals.kcal + (ingredient.kcal * ingredient.quantity),
      }),
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

  const dayGroups = groupMealsByDay(meals);

  if (meals.length === 0) {
    return (
      <div css={css`
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      `}>
        <div css={css`
          text-align: center;
          padding: 3rem;
          color: #666;
          font-size: 1.1rem;
        `}>
          <h3>No meals yet</h3>
          <p>Add your first meal to start tracking your nutrition!</p>
        </div>
      </div>
    );
  }

  return (
    <div css={css`
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    `}>
      {dayGroups.map((dayGroup) => (
        <div key={dayGroup.date} css={css`
          margin-bottom: 3rem;
        `}>
          <div css={css`
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1.5rem;
            border-radius: 8px 8px 0 0;
            margin-bottom: 0;
          `}>
            <h2 css={css`
              font-size: 1.5rem;
              font-weight: 700;
              margin: 0 0 0.5rem 0;
            `}>{dayGroup.dateLabel}</h2>
            <div css={css`
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 1rem;
              margin-top: 1rem;
            `}>
              <div css={css`
                text-align: center;
                background: rgba(255, 255, 255, 0.2);
                padding: 1rem;
                border-radius: 6px;
                
                span:first-child {
                  display: block;
                  font-size: 0.875rem;
                  opacity: 0.9;
                  margin-bottom: 0.25rem;
                }
                
                span:last-child {
                  display: block;
                  font-size: 1.25rem;
                  font-weight: 700;
                }
              `}>
                <span>Total Calories</span>
                <span>{dayGroup.totals.kcal.toFixed(0)}</span>
              </div>
              <div css={css`
                text-align: center;
                background: rgba(255, 255, 255, 0.2);
                padding: 1rem;
                border-radius: 6px;
                
                span:first-child {
                  display: block;
                  font-size: 0.875rem;
                  opacity: 0.9;
                  margin-bottom: 0.25rem;
                }
                
                span:last-child {
                  display: block;
                  font-size: 1.25rem;
                  font-weight: 700;
                }
              `}>
                <span>Protein</span>
                <span>{dayGroup.totals.protein.toFixed(1)}g</span>
              </div>
              <div css={css`
                text-align: center;
                background: rgba(255, 255, 255, 0.2);
                padding: 1rem;
                border-radius: 6px;
                
                span:first-child {
                  display: block;
                  font-size: 0.875rem;
                  opacity: 0.9;
                  margin-bottom: 0.25rem;
                }
                
                span:last-child {
                  display: block;
                  font-size: 1.25rem;
                  font-weight: 700;
                }
              `}>
                <span>Carbs</span>
                <span>{dayGroup.totals.carbs.toFixed(1)}g</span>
              </div>
              <div css={css`
                text-align: center;
                background: rgba(255, 255, 255, 0.2);
                padding: 1rem;
                border-radius: 6px;
                
                span:first-child {
                  display: block;
                  font-size: 0.875rem;
                  opacity: 0.9;
                  margin-bottom: 0.25rem;
                }
                
                span:last-child {
                  display: block;
                  font-size: 1.25rem;
                  font-weight: 700;
                }
              `}>
                <span>Fat</span>
                <span>{dayGroup.totals.fat.toFixed(1)}g</span>
              </div>
            </div>
          </div>
          
          <div css={css`
            background: white;
            border-radius: 0 0 8px 8px;
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
                    padding: 1.5rem;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                  `}>
                    <div>
                      <h3 css={css`
                        font-size: 1.25rem;
                        font-weight: 600;
                        color: #333;
                        margin: 0;
                      `}>{meal.name}</h3>
                      <p css={css`
                        color: #666;
                        font-size: 0.9rem;
                      `}>{formatDateTime(meal.datetime)}</p>
                    </div>
                    <div css={css`
                      display: flex;
                      gap: 0.5rem;
                    `}>
                      <button css={css`
                        padding: 0.5rem 1rem;
                        border: none;
                        border-radius: 4px;
                        font-size: 0.875rem;
                        cursor: pointer;
                        transition: background-color 0.2s;
                        background-color: #007bff;
                        color: white;
                        
                        &:hover {
                          background-color: #0056b3;
                        }
                      `} onClick={() => onEdit(meal)}>
                        Edit
                      </button>
                      <button css={css`
                        padding: 0.5rem 1rem;
                        border: none;
                        border-radius: 4px;
                        font-size: 0.875rem;
                        cursor: pointer;
                        transition: background-color 0.2s;
                        background-color: #dc3545;
                        color: white;
                        
                        &:hover {
                          background-color: #c82333;
                        }
                      `} onClick={() => meal.id && onDelete(meal.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div css={css`
                    padding: 1.5rem;
                  `}>
                    <h4>Ingredients</h4>
                    <div css={css`
                      display: grid;
                      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                      gap: 1rem;
                      margin-top: 1rem;
                    `}>
                      {meal.ingredients.map((ingredient, index) => (
                        <div key={index} css={css`
                          background: #f8f9fa;
                          padding: 1rem;
                          border-radius: 4px;
                          border-left: 4px solid #007bff;
                        `}>
                          <div css={css`
                            font-weight: 600;
                            color: #333;
                            margin-bottom: 0.5rem;
                          `}>
                            {ingredient.quantity > 1 ? `${ingredient.quantity} × ` : ''}{ingredient.name}
                          </div>
                          <div css={css`
                            display: grid;
                            grid-template-columns: repeat(4, 1fr);
                            gap: 0.5rem;
                            font-size: 0.875rem;
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
                              <span>{(ingredient.carbs * ingredient.quantity).toFixed(1)}g</span>
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
                              <span>{(ingredient.fat * ingredient.quantity).toFixed(1)}g</span>
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
                              <span>{(ingredient.protein * ingredient.quantity).toFixed(1)}g</span>
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
                              <span>{(ingredient.kcal * ingredient.quantity).toFixed(0)}</span>
                            </div>
                          </div>
                          {ingredient.quantity > 1 && (
                            <div css={css`
                              margin-top: 0.5rem;
                              font-size: 0.75rem;
                              color: #666;
                              text-align: center;
                            `}>
                              Per unit: {ingredient.carbs}g carbs, {ingredient.fat}g fat, {ingredient.protein}g protein, {ingredient.kcal} kcal
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
                      grid-template-columns: repeat(4, 1fr);
                      gap: 1rem;
                    `}>
                      <div css={css`
                        text-align: center;
                        padding: 1rem;
                        background: #e9ecef;
                        border-radius: 4px;
                        
                        span:first-child {
                          display: block;
                          font-weight: 600;
                          color: #666;
                          font-size: 0.875rem;
                        }
                        
                        span:last-child {
                          display: block;
                          font-size: 1.25rem;
                          font-weight: 700;
                          color: #333;
                        }
                      `}>
                        <span>Total Carbs</span>
                        <span>{mealTotals.carbs.toFixed(1)}g</span>
                      </div>
                      <div css={css`
                        text-align: center;
                        padding: 1rem;
                        background: #e9ecef;
                        border-radius: 4px;
                        
                        span:first-child {
                          display: block;
                          font-weight: 600;
                          color: #666;
                          font-size: 0.875rem;
                        }
                        
                        span:last-child {
                          display: block;
                          font-size: 1.25rem;
                          font-weight: 700;
                          color: #333;
                        }
                      `}>
                        <span>Total Fat</span>
                        <span>{mealTotals.fat.toFixed(1)}g</span>
                      </div>
                      <div css={css`
                        text-align: center;
                        padding: 1rem;
                        background: #e9ecef;
                        border-radius: 4px;
                        
                        span:first-child {
                          display: block;
                          font-weight: 600;
                          color: #666;
                          font-size: 0.875rem;
                        }
                        
                        span:last-child {
                          display: block;
                          font-size: 1.25rem;
                          font-weight: 700;
                          color: #333;
                        }
                      `}>
                        <span>Total Protein</span>
                        <span>{mealTotals.protein.toFixed(1)}g</span>
                      </div>
                      <div css={css`
                        text-align: center;
                        padding: 1rem;
                        background: #e9ecef;
                        border-radius: 4px;
                        
                        span:first-child {
                          display: block;
                          font-weight: 600;
                          color: #666;
                          font-size: 0.875rem;
                        }
                        
                        span:last-child {
                          display: block;
                          font-size: 1.25rem;
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


