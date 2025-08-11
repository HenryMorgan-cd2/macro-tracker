import { Routes, Route } from 'react-router-dom';
import { MealsPage } from './pages/MealsPage';
import { AddMealPage } from './pages/AddMealPage';
import { EditMealPage } from './pages/EditMealPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { MealTemplatesPage } from './pages/MealTemplatesPage';
import { DailyTargetsPage } from './pages/DailyTargetsPage';

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<MealsPage />} />
      <Route path="/add-meal" element={<AddMealPage />} />
      <Route path="/edit-meal/:id" element={<EditMealPage />} />
      <Route path="/templates" element={<TemplatesPage />} />
      <Route path="/meal-templates" element={<MealTemplatesPage />} />
      <Route path="/daily-targets" element={<DailyTargetsPage />} />
    </Routes>
  );
}
