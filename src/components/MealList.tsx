/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from 'react';
import { css } from '@emotion/react';
import { Meal, DailyTargets } from '../types';
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
  // Initialize with all meals collapsed by default
  const [collapsedMeals, setCollapsedMeals] = useState<Set<number>>(() => {
    const initialCollapsed = new Set<number>();
    meals.forEach(meal => {
      if (meal.id) {
        initialCollapsed.add(meal.id);
      }
    });
    return initialCollapsed;
  });

  // State for dropdown menus
  const [openMenus, setOpenMenus] = useState<Set<number>>(new Set());

  // Track viewport to control collapse behavior per device size
  const [isDesktop, setIsDesktop] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth >= 768 : false);
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close menus when clicking outside of any menu container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      // If the click is inside any menu container, do nothing
      if (target && target.closest && target.closest('[data-menu-container]')) {
        return;
      }
      if (openMenus.size > 0) {
        setOpenMenus(new Set());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenus]);

  const toggleMealCollapse = (mealId: number) => {
    const newCollapsed = new Set(collapsedMeals);
    if (newCollapsed.has(mealId)) {
      newCollapsed.delete(mealId);
    } else {
      newCollapsed.add(mealId);
    }
    setCollapsedMeals(newCollapsed);
  };

  const toggleMenu = (mealId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const newOpenMenus = new Set(openMenus);
    if (newOpenMenus.has(mealId)) {
      newOpenMenus.delete(mealId);
    } else {
      // Close other open menus first
      newOpenMenus.clear();
      newOpenMenus.add(mealId);
    }
    setOpenMenus(newOpenMenus);
  };

  const closeMenu = (mealId: number) => {
    const newOpenMenus = new Set(openMenus);
    newOpenMenus.delete(mealId);
    setOpenMenus(newOpenMenus);
  };

  const isCollapsed = (mealId: number) => isDesktop ? false : collapsedMeals.has(mealId);
  const isMenuOpen = (mealId: number) => openMenus.has(mealId);

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

  // Format ingredient quantities, showing decimals when needed (e.g., 0.5)
  const formatQuantity = (quantity: number) => {
    if (Number.isInteger(quantity)) return quantity.toString();
    return parseFloat(quantity.toFixed(2)).toString();
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
    // Determine if we have at least one bound (min or max)
    const hasTargets = !!(targets && typeof targets === 'object' && (('min' in targets) || ('max' in targets)));
    
    // Convert to the expected type for progress calculation, allowing partial targets
    const progressTargets = targets && typeof targets === 'object'
      ? { min: 'min' in targets ? targets.min : undefined, max: 'max' in targets ? targets.max : undefined }
      : undefined;
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
              {renderMacroCard('carbs', 'Carbs', dayGroup.totals.carbs, 'g', dailyTargets?.carbs)}
              {renderMacroCard('protein', 'Protein', dayGroup.totals.protein, 'g', dailyTargets?.protein)}
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
                  border-bottom: 2px solid #e0e0e0;
                  
                  &:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                  }
                `}>
                  <div css={css`
                    padding: clamp(0.75rem, 3vw, 1rem) clamp(1rem, 4vw, 1.5rem) clamp(1rem, 4vw, 1.5rem);
                    background: #fafbfc;
                    border-radius: var(--border-radius) var(--border-radius) 0 0;
                    border-bottom: 1px solid #e9ecef;
                  `}>
                    {/* Header row with title and actions */}
                    <div css={css`
                      display: flex;
                      align-items: flex-end;
                      justify-content: space-between;
                      margin-bottom: 1rem;
                    `}>
                      <div css={css`
                        flex: 1;
                        min-width: 0;
                      `}>
                        <div css={css`
                          display: flex;
                          align-items: center;
                          gap: 0.75rem;
                          margin-bottom: 0.5rem;
                        `}>
                          <h3 css={css`
                            font-size: clamp(1.1rem, 3.5vw, 1.25rem);
                            font-weight: 600;
                            color: #333;
                            margin: 0;
                            word-wrap: break-word;
                            overflow-wrap: break-word;
                          `}>{meal.name}</h3>
                          <span css={css`
                            color: #666;
                            font-size: clamp(0.8rem, 2.5vw, 0.9rem);
                            white-space: nowrap;
                          `}>{formatDateTime(meal.datetime)}</span>
                        </div>
                      </div>
                      
                      {/* Actions section */}
                      <div css={css`
                        flex-shrink: 0;
                        margin-left: 1rem;
                      `}>
                        <div css={css`
                          position: relative;
                        `} data-menu-container>
                          <button css={css`
                            background: #f8f9fa;
                            border: 1px solid #e9ecef;
                            border-radius: var(--border-radius);
                            padding: 0.5rem;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            min-width: 2.5rem;
                            height: 2.5rem;
                            transition: background-color 0.2s ease;
                            
                            &:hover {
                              background: #e9ecef;
                            }
                            
                            &:focus {
                              outline: none;
                              box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
                            }
                          `} 
                          onClick={(event) => toggleMenu(meal.id || 0, event)}
                          aria-label={`Actions for ${meal.name}`}
                          aria-expanded={isMenuOpen(meal.id || 0)}
                          aria-haspopup="true">
                            <span css={css`
                              font-size: 1.2rem;
                              color: #666;
                              line-height: 1;
                            `}>⋯</span>
                          </button>
                          
                          <div css={css`
                            position: absolute;
                            top: 100%;
                            right: 0;
                            margin-top: 0.25rem;
                            background: white;
                            border: 1px solid #e9ecef;
                            border-radius: var(--border-radius);
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                            z-index: 1000;
                            min-width: 120px;
                            display: ${isMenuOpen(meal.id || 0) ? 'block' : 'none'};
                            
                            @media (max-width: 767px) {
                              right: 0;
                              min-width: 140px;
                            }
                          `} role="menu" aria-label="Meal actions">
                            <button css={css`
                              width: 100%;
                              padding: 0.75rem 1rem;
                              border: none;
                              background: none;
                              text-align: left;
                              cursor: pointer;
                              color: #007bff;
                              font-size: 0.875rem;
                              border-bottom: 1px solid #f1f3f4;
                              
                              &:hover {
                                background: #f8f9fa;
                              }
                              
                              &:last-child {
                                border-bottom: none;
                              }
                            `} 
                            onClick={() => {
                              onEdit(meal);
                              closeMenu(meal.id || 0);
                            }}
                            role="menuitem">
                              Edit
                            </button>
                            <button css={css`
                              width: 100%;
                              padding: 0.75rem 1rem;
                              border: none;
                              background: none;
                              text-align: left;
                              cursor: pointer;
                              color: #28a745;
                              font-size: 0.875rem;
                              border-bottom: 1px solid #f1f3f4;
                              
                              &:hover {
                                background: #f8f9fa;
                              }
                            `} 
                            onClick={() => {
                              onDuplicate(meal);
                              closeMenu(meal.id || 0);
                            }}
                            role="menuitem">
                              Duplicate
                            </button>
                            <button css={css`
                              width: 100%;
                              padding: 0.75rem 1rem;
                              border: none;
                              background: none;
                              text-align: left;
                              cursor: pointer;
                              color: #dc3545;
                              font-size: 0.875rem;
                              
                              &:hover {
                                background: #f8f9fa;
                              }
                            `} 
                            onClick={() => {
                              if (meal.id) {
                                onDelete(meal.id);
                                closeMenu(meal.id);
                              }
                            }}
                            role="menuitem">
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Meal macros summary below header */}
                    <div css={css`
                      display: grid;
                      grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
                      gap: 0.5rem;
                      max-width: 400px;
                      margin-bottom: 0.75rem;
                    `}>
                      <div css={css`
                        text-align: center;
                        padding: 0.5rem;
                        background: #ffffff;
                        border-radius: var(--border-radius);
                        border: 1px solid #e9ecef;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                      `}>
                        <div css={css`
                          font-size: clamp(0.7rem, 2vw, 0.8rem);
                          color: #666;
                          font-weight: 600;
                        `}>kcal</div>
                        <div css={css`
                          font-size: clamp(0.9rem, 2.5vw, 1rem);
                          color: #333;
                          font-weight: 700;
                        `}>{mealTotals.kcal.toFixed(0)}</div>
                      </div>
                      <div css={css`
                        text-align: center;
                        padding: 0.5rem;
                        background: #ffffff;
                        border-radius: var(--border-radius);
                        border: 1px solid #e9ecef;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                      `}>
                        <div css={css`
                          font-size: clamp(0.7rem, 2vw, 0.8rem);
                          color: #666;
                          font-weight: 600;
                        `}>Carbs</div>
                        <div css={css`
                          font-size: clamp(0.9rem, 2.5vw, 1rem);
                          color: #333;
                          font-weight: 700;
                        `}>{mealTotals.carbs.toFixed(1)}g</div>
                      </div>
                      <div css={css`
                        text-align: center;
                        padding: 0.5rem;
                        background: #ffffff;
                        border-radius: var(--border-radius);
                        border: 1px solid #e9ecef;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                      `}>
                        <div css={css`
                          font-size: clamp(0.7rem, 2vw, 0.8rem);
                          color: #666;
                          font-weight: 600;
                        `}>Protein</div>
                        <div css={css`
                          font-size: clamp(0.9rem, 2.5vw, 1rem);
                          color: #333;
                          font-weight: 700;
                        `}>{mealTotals.protein.toFixed(1)}g</div>
                      </div>
                      <div css={css`
                        text-align: center;
                        padding: 0.5rem;
                        background: #ffffff;
                        border-radius: var(--border-radius);
                        border: 1px solid #e9ecef;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                      `}>
                        <div css={css`
                          font-size: clamp(0.7rem, 2vw, 0.8rem);
                          color: #666;
                          font-weight: 600;
                        `}>Fat</div>
                        <div css={css`
                          font-size: clamp(0.9rem, 2.5vw, 1rem);
                          color: #333;
                          font-weight: 700;
                        `}>{mealTotals.fat.toFixed(1)}g</div>
                      </div>
                    </div>
                    
                    {/* Collapsible toggle below macro summary */}
                    <div css={css`
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                      padding: 0.5rem;
                      background: #f0f2f5;
                      border-radius: var(--border-radius);
                      border: 1px solid #e1e5e9;
                      cursor: pointer;
                      transition: background-color 0.2s ease;
                      
                      &:hover {
                        background: #e4e7eb;
                      }
                      
                      @media (min-width: 768px) {
                        display: none;
                      }
                    `} onClick={() => toggleMealCollapse(meal.id || 0)}>
                      <span css={css`
                        font-size: clamp(0.75rem, 2.5vw, 0.85rem);
                        font-weight: 600;
                        color: #495057;
                      `}>
                        {meal.ingredients.length} ingredient{meal.ingredients.length !== 1 ? 's' : ''}
                      </span>
                      <span css={css`
                        font-size: clamp(0.75rem, 2.5vw, 0.85rem);
                        color: #6c757d;
                        transition: transform 0.2s ease;
                        transform: rotate(${isCollapsed(meal.id || 0) ? '0deg' : '180deg'});
                      `}>
                        ▼
                      </span>
                    </div>
                  </div>
                  
                  <div css={css`
                    display: ${isCollapsed(meal.id || 0) ? 'none' : 'block'};
                    padding: clamp(0.75rem, 3vw, 1rem);
                    background: #ffffff;
                    border-radius: 0 0 var(--border-radius) var(--border-radius);
                  `}>
                    <div css={css`
                      @media (min-width: 768px) {
                        display: block;
                      }
                    `}>
                      <div css={css`
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                        gap: 0.75rem;
                      `}>
                        {meal.ingredients.map((ingredient, index) => (
                          <div key={index} css={css`
                            background: #f8f9fa;
                            padding: 0.75rem;
                            border-radius: var(--border-radius);
                            border-left: 3px solid #007bff;
                            border: 1px solid #e9ecef;
                          `}>
                            <div css={css`
                              font-weight: 600;
                              color: #333;
                              margin-bottom: 0.5rem;
                              word-wrap: break-word;
                              overflow-wrap: break-word;
                              font-size: clamp(0.8rem, 2.5vw, 0.9rem);
                            `}>
                              {ingredient.name} {ingredient.macroUnit === 'per_100g' 
                                ? `(${parseFloat(ingredient.quantity.toFixed(2))}g)` 
                                : ingredient.quantity !== 1 
                                  ? ` x ${formatQuantity(ingredient.quantity)}` 
                                  : ''
                              }
                            </div>
                            <div css={css`
                              display: grid;
                              grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
                              gap: 0.5rem;
                              font-size: clamp(0.7rem, 2vw, 0.8rem);
                            `}>
                              <div css={css`
                                text-align: center;
                                
                                span:first-child {
                                  display: block;
                                  font-weight: 600;
                                  color: #666;
                                  font-size: clamp(0.65rem, 1.8vw, 0.75rem);
                                }
                                
                                span:last-child {
                                  color: #333;
                                  font-size: clamp(0.7rem, 2vw, 0.8rem);
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
                              <div css={css`
                                text-align: center;
                                
                                span:first-child {
                                  display: block;
                                  font-weight: 600;
                                  color: #666;
                                  font-size: clamp(0.65rem, 1.8vw, 0.75rem);
                                }
                                
                                span:last-child {
                                  color: #333;
                                  font-size: clamp(0.7rem, 2vw, 0.8rem);
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
                                  font-size: clamp(0.65rem, 1.8vw, 0.75rem);
                                }
                                
                                span:last-child {
                                  color: #333;
                                  font-size: clamp(0.7rem, 2vw, 0.8rem);
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
                                  font-size: clamp(0.65rem, 1.8vw, 0.75rem);
                                }
                                
                                span:last-child {
                                  color: #333;
                                  font-size: clamp(0.7rem, 2vw, 0.8rem);
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
                            </div>
                            {ingredient.quantity > 1 && (
                              <div css={css`
                                margin-top: 0.5rem;
                                font-size: clamp(0.6rem, 1.8vw, 0.7rem);
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


