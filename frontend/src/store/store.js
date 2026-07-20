import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import recipeReducer from './recipeSlice';
import favoriteReducer from './favoriteSlice';
import mealPlanReducer from './mealPlanSlice';
import adminReducer from './adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    recipe: recipeReducer,
    favorite: favoriteReducer,
    mealPlan: mealPlanReducer,
    admin: adminReducer,
  },
});
