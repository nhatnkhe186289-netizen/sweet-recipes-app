import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from '../services/admin.service';

export const fetchAdminUsers = createAsyncThunk('admin/fetchUsers', async (_, thunkAPI) => {
  try {
    return await adminService.getUsers();
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const changeUserRole = createAsyncThunk('admin/changeRole', async ({ userId, role }, thunkAPI) => {
  try {
    return await adminService.updateUserRole(userId, role);
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const changeUserStatus = createAsyncThunk('admin/changeStatus', async ({ userId, status }, thunkAPI) => {
  try {
    return await adminService.updateUserStatus(userId, status);
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteUserAccount = createAsyncThunk('admin/deleteUser', async (userId, thunkAPI) => {
  try {
    await adminService.deleteUser(userId);
    return userId;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchAdminRecipes = createAsyncThunk('admin/fetchRecipes', async (_, thunkAPI) => {
  try {
    return await adminService.getRecipes();
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const changeRecipeStatus = createAsyncThunk('admin/changeRecipeStatus', async ({ recipeId, status }, thunkAPI) => {
  try {
    return await adminService.updateRecipeStatus(recipeId, status);
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

const initialState = {
  users: [],
  recipes: [],
  isLoading: false,
  isError: false,
  message: '',
};

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    resetAdminState: (state) => {
      state.users = [];
      state.recipes = [];
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchAdminUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Change User Role
      .addCase(changeUserRole.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u._id === action.payload._id);
        if (index !== -1) {
          state.users[index].role = action.payload.role;
        }
      })
      // Change User Status
      .addCase(changeUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u._id === action.payload._id);
        if (index !== -1) {
          state.users[index].status = action.payload.status;
        }
      })
      // Delete User Account
      .addCase(deleteUserAccount.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      })
      // Fetch Admin Recipes
      .addCase(fetchAdminRecipes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAdminRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recipes = action.payload;
      })
      .addCase(fetchAdminRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Change Recipe status
      .addCase(changeRecipeStatus.fulfilled, (state, action) => {
        const index = state.recipes.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.recipes[index].status = action.payload.status;
        }
      });
  },
});

export const { resetAdminState } = adminSlice.actions;
export default adminSlice.reducer;
