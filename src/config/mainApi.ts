import axios from 'axios';
import { BASE_URL } from './config';

// Create an axios instance with default configuration
const mainApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default mainApi;
