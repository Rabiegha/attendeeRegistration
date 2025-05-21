import axios from 'axios';
import { BASE_URL } from '../../../config/config';
import { Buffer } from 'buffer';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { LoginCredentials, LoginResponse, UserInfo } from '../../../types/auth.types';

export const loginThunk = createAsyncThunk<
  UserInfo, 
  LoginCredentials,
  {
    rejectValue: string;
  }
>(
  'loginThunk',
  async ({email, password}, thunkAPI) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      return thunkAPI.rejectWithValue('Login timeout exceeded');
    }, 10000);

    try {
      // Encode to base64
      const encodeBase64 = (value: string): string => Buffer.from(value).toString('base64');
      const encUserName = encodeURIComponent(encodeBase64(email));
      const encPassword = encodeURIComponent(encodeBase64(password));

      // API call
      const url = `${BASE_URL}/ajax_user_login/?enc_email=${encUserName}&enc_password=${encPassword}`;
      const response = await axios.post<LoginResponse>(url, { signal: controller.signal });

      clearTimeout(timeout);

      // If success
      if (response.data.status) {
        return response.data.user_details;
      } else {
        return thunkAPI.rejectWithValue('Login failed');
      }
    } catch (error) {
      clearTimeout(timeout);
      if (axios.isCancel(error)) {
        return thunkAPI.rejectWithValue('Request was cancelled');
      }
      const err = error as Error;
      return thunkAPI.rejectWithValue(err.message);
    }
  },
);
