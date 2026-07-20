import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import recipeReducer from './recipeSlice';
import favoriteReducer from './favoriteSlice';
import shoppingListReducer from './shoppingListSlice';
import mealPlanReducer from './mealPlanSlice';
import adminReducer from './adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    recipe: recipeReducer,
    favorite: favoriteReducer,
    shoppingList: shoppingListReducer,
    mealPlan: mealPlanReducer,
    admin: adminReducer,
  },
});
