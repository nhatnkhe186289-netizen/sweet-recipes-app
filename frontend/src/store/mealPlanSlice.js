import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import mealPlanService from '../services/mealPlan.service';

export const fetchMealPlans = createAsyncThunk('mealPlans/fetchAll', async (_, thunkAPI) => {
  try {
    return await mealPlanService.getMealPlans();
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const addMealPlan = createAsyncThunk('mealPlans/create', async (planData, thunkAPI) => {
  try {
    return await mealPlanService.createMealPlan(planData);
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const removeMealPlan = createAsyncThunk('mealPlans/delete', async (id, thunkAPI) => {
  try {
    await mealPlanService.deleteMealPlan(id);
    return id; // Return the deleted plan ID
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

const initialState = {
  plans: [],
  isLoading: false,
  isError: false,
  message: '',
};

export const mealPlanSlice = createSlice({
  name: 'mealPlan',
  initialState,
  reducers: {
    resetMealPlanState: (state) => {
      state.plans = [];
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Plans
      .addCase(fetchMealPlans.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMealPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = action.payload;
      })
      .addCase(fetchMealPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Add Plan
      .addCase(addMealPlan.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addMealPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans.push(action.payload);
      })
      .addCase(addMealPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Remove Plan
      .addCase(removeMealPlan.fulfilled, (state, action) => {
        state.plans = state.plans.filter((plan) => plan._id !== action.payload);
      });
  },
});

export const { resetMealPlanState } = mealPlanSlice.actions;
export default mealPlanSlice.reducer;
