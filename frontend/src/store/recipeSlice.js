import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import recipeService from '../services/recipe.service';

export const fetchRecipes = createAsyncThunk('recipes/fetchAll', async (params, thunkAPI) => {
  try {
    return await recipeService.getRecipes(params);
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchCategories = createAsyncThunk('recipes/fetchCategories', async (_, thunkAPI) => {
  try {
    return await recipeService.getCategories();
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

const initialState = {
  recipes: [],
  categories: [],
  isLoading: false,
  isError: false,
  message: '',
};

export const recipeSlice = createSlice({
  name: 'recipe',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Recipes
      .addCase(fetchRecipes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recipes = action.payload;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Fetch Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export default recipeSlice.reducer;
