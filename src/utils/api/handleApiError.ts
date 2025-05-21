import axios from 'axios';

/**
 * Handles API errors in a consistent way
 * @param error The error object from axios
 * @param defaultMessage Default message to show if error details are not available
 */
export const handleApiError = (error: any, defaultMessage = 'An error occurred') => {
  if (axios.isCancel(error)) {
    console.warn('Request was cancelled:', error.message);
    return { message: 'Request was cancelled', cancelled: true };
  }

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('API Error Response:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers,
    });
    return {
      message: error.response.data?.message || `Error ${error.response.status}`,
      status: error.response.status,
    };
  } else if (error.request) {
    // The request was made but no response was received
    console.error('API Error Request:', error.request);
    return { message: 'No response received from server' };
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('API Error Setup:', error.message);
    return { message: error.message || defaultMessage };
  }
};
