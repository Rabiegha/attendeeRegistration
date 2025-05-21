import { handleApiError } from '../utils/api/handleApiError';
import { cleanParams } from '../utils/api/cleanParams';
import mainApi from '../config/mainApi';

interface EventListResponse {
  status: boolean;
  event_details: any[];
  message?: string;
}

export const fetchEventList = async (userId: string, isEventFrom: string, options = {}) => {
  // Validate inputs
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  if (!['0', '1', '2'].includes(isEventFrom)) {
    throw new Error('Invalid isEventFrom value. Must be "0" (past), "1" (today), or "2" (future)');
  }

  try {
    // Ensure userId is a string and not empty
    if (!userId) {
      throw new Error('User ID is required');
    }

    const params = cleanParams({
      current_user_login_details_id: userId.toString(),
      is_event_from: isEventFrom
    });

    const response = await mainApi.get<EventListResponse>(
      '/ajax_get_event_details/',
      { params, ...options }
    );

    if (!response.data || !response.data.status || !response.data.event_details) {
      console.log('Params sent to API:', params);
      console.log('Full API response:', response.data);
      throw new Error(response.data?.message || 'Invalid event data from server');
    }

    return response.data;
  } catch (error: any) {
    // Log detailed error information
    console.error('[fetchEventList] Error details:', {
      userId,
      isEventFrom,
      errorName: error.name,
      errorMessage: error.message,
      errorResponse: error.response?.data,
      errorStatus: error.response?.status,
    });

    // Handle network timeouts specifically
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }

    // Handle API errors
    handleApiError(error, 'Failed to fetch event list');
    
    // Rethrow with a user-friendly message
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch event list. Please try again.'
    );
  }
};
