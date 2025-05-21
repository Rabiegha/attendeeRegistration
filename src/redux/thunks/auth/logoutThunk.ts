import { createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from '../../../config/config';
import axios from 'axios';
import { RootState } from '../../store';

export const logoutThunk = createAsyncThunk<
  void,
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>(
  'logoutThunk',
  async (_, thunkAPI) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      return thunkAPI.rejectWithValue('Logout timeout exceeded');
    }, 10000);

    try {
      const state = thunkAPI.getState();
      const userId = state.auth.currentUserId;

      if (!userId) {
        clearTimeout(timeout);
        return thunkAPI.rejectWithValue('No user ID found');
      }

      // API call to logout
      const url = `${BASE_URL}/ajax_user_logout/?current_user_login_details_id=${userId}`;
      const response = await axios.post(url, {}, { signal: controller.signal });

      clearTimeout(timeout);

      if (response.data.status) {
        return;
      } else {
        return thunkAPI.rejectWithValue(response.data.message || 'Logout failed');
      }
    } catch (error) {
      clearTimeout(timeout);
      if (axios.isCancel(error)) {
        return thunkAPI.rejectWithValue('Request was cancelled');
      }
      const err = error as Error;
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);
