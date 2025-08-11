import { DailyTargets, MacroProgress } from '../types';

export function calculateMacroProgress(
  current: number, 
  targets: { min?: number; max?: number } | undefined
): MacroProgress {
  if (!targets) {
    return {
      current,
      percentage: 0,
      status: 'no_target'
    };
  }

  const { min, max } = targets;
  
  if (min !== undefined && max !== undefined) {
    // Both min and max specified
    const range = max - min;
    const progress = current - min;
    
    if (current < min) {
      // Below minimum - show progress toward minimum
      const percentage = Math.max(0, Math.min(100, (current / min) * 100));
      return { current, min, max, percentage, status: 'below_min' };
    } else if (current > max) {
      // Above maximum - show as 100% + overflow
      const percentage = 100 + Math.min(50, ((current - max) / max) * 100);
      return { current, min, max, percentage, status: 'above_max' };
    } else {
      // Within range - show progress from min to max
      const percentage = Math.max(0, Math.min(100, (progress / range) * 100));
      return { current, min, max, percentage, status: 'within_range' };
    }
  } else if (min !== undefined) {
    // Only min specified
    if (current < min) {
      // Below minimum - show progress toward minimum
      const percentage = Math.max(0, Math.min(100, (current / min) * 100));
      return { current, min, percentage, status: 'below_min' };
    } else {
      // Above minimum - show as 100% + some buffer
      const percentage = Math.min(120, 100 + ((current - min) / min) * 20);
      return { current, min, percentage, status: 'within_range' };
    }
  } else if (max !== undefined) {
    // Only max specified
    if (current > max) {
      // Above maximum - show as 100% + overflow
      const percentage = 100 + Math.min(50, ((current - max) / max) * 100);
      return { current, max, percentage, status: 'above_max' };
    } else {
      // Below maximum - show progress toward maximum
      const percentage = Math.max(0, Math.min(100, (current / max) * 100));
      return { current, max, percentage, status: 'within_range' };
    }
  }
  
  return {
    current,
    percentage: 0,
    status: 'no_target'
  };
}

export function getProgressColor(status: MacroProgress['status']): string {
  switch (status) {
    case 'below_min':
      return '#ffffff'; // Pure white - maximum contrast
    case 'above_max':
      return '#fbbf24'; // Amber-400 - much brighter and more visible
    case 'within_range':
      return '#34d399'; // Emerald-400 - brighter green with better contrast
    case 'no_target':
    default:
      return '#e5e7eb'; // Gray-200 - light gray for better visibility
  }
}

export function getProgressText(status: MacroProgress['status'], macro: string): string {
  switch (status) {
    case 'below_min':
      return `Below ${macro} target`;
    case 'above_max':
      return `Above ${macro} target`;
    case 'within_range':
      return `${macro} target met`;
    case 'no_target':
    default:
      return `No ${macro} target`;
  }
}

export function getProgressBarWidth(percentage: number): string {
  // Cap the visual width at 100% for the bar, but allow overflow indication
  const visualPercentage = Math.min(100, percentage);
  return `${visualPercentage}%`;
}

export function shouldShowOverflowIndicator(percentage: number): boolean {
  return percentage > 100;
}
