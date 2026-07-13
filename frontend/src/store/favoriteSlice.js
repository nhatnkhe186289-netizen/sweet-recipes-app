import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import favoriteService from '../services/favorite.service';

export const fetchFavorites = createAsyncThunk('favorite/fetchAll', async (_, thunkAPI) => {
  try {
    return await favoriteService.getFavorites();
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const toggleFavorite = createAsyncThunk('favorite/toggle', async (recipeId, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const isFav = state.favorite.favoriteIds.includes(recipeId);

    if (isFav) {
      await favoriteService.removeFavorite(recipeId);
      thunkAPI.dispatch(fetchFavorites());
      return { recipeId, isRemoved: true };
    } else {
      const addedFav = await favoriteService.addFavorite(recipeId);
      thunkAPI.dispatch(fetchFavorites());
      return { recipeId, isRemoved: false };
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const clearAllFavorites = createAsyncThunk('favorite/clearAll', async (_, thunkAPI) => {
  try {
    await favoriteService.clearFavorites();
    thunkAPI.dispatch(fetchFavorites());
    return true;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

const initialState = {
  favorites: [],
  favoriteIds: [],
  isLoading: false,
  isError: false,
  message: '',
};

export const favoriteSlice = createSlice({
  name: 'favorite',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Favorites
      .addCase(fetchFavorites.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites = action.payload;
        state.favoriteIds = action.payload.map(r => r._id);
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Toggle Favorite
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { recipeId, isRemoved } = action.payload;
        if (isRemoved) {
          state.favoriteIds = state.favoriteIds.filter(id => id !== recipeId);
          state.favorites = state.favorites.filter(r => r._id !== recipeId);
        } else {
          state.favoriteIds.push(recipeId);
          // Re-fetching full list or handling offline insert
        }
      })
      // Clear All Favorites
      .addCase(clearAllFavorites.fulfilled, (state) => {
        state.favorites = [];
        state.favoriteIds = [];
      });
  },
});

export default favoriteSlice.reducer;
