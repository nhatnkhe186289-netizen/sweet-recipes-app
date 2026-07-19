import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import shoppingListService from '../services/shoppingList.service';

export const fetchShoppingList = createAsyncThunk(
  'shoppingList/fetch',
  async (_, thunkAPI) => {
    try {
      return await shoppingListService.getShoppingList();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const addItems = createAsyncThunk(
  'shoppingList/add',
  async (payload, thunkAPI) => {
    try {
      return await shoppingListService.addShoppingListItems(payload);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const toggleItemBought = createAsyncThunk(
  'shoppingList/toggle',
  async (id, thunkAPI) => {
    try {
      return await shoppingListService.toggleBought(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteItem = createAsyncThunk(
  'shoppingList/delete',
  async (id, thunkAPI) => {
    try {
      return await shoppingListService.deleteShoppingListItem(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const clearAllItems = createAsyncThunk(
  'shoppingList/clear',
  async (_, thunkAPI) => {
    try {
      return await shoppingListService.clearShoppingList();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const shoppingListSlice = createSlice({
  name: 'shoppingList',
  initialState: {
    items: [],
    isLoading: false,
    isError: false,
    message: '',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShoppingList.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchShoppingList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchShoppingList.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(addItems.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) {
          state.items = [...action.payload, ...state.items];
        } else if (action.payload) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(toggleItemBought.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(clearAllItems.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export default shoppingListSlice.reducer;
