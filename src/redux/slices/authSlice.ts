import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, UserInfo } from '../../types/auth.types';
import { loginThunk } from '../thunks/auth/loginThunk';
import { logoutThunk } from '../thunks/auth/logoutThunk';

const initialState: AuthState = {
  isLoading: false,
  currentUserId: null,
  userType: null,
  userInfo: null,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login thunk actions
    builder.addCase(loginThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginThunk.fulfilled, (state, action: PayloadAction<UserInfo>) => {
      state.isLoading = false;
      state.userInfo = action.payload;
      state.currentUserId = action.payload.current_user_login_details_id;
      state.userType = action.payload.user_type_name;
      state.error = null;
    });
    builder.addCase(loginThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Login failed';
    });

    // Logout thunk actions
    builder.addCase(logoutThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.isLoading = false;
      state.currentUserId = null;
      state.userType = null;
      state.userInfo = null;
    });
    builder.addCase(logoutThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Logout failed';
    });
  },
});

export const { resetError } = authSlice.actions;

export default authSlice.reducer;
