import { handleApiError } from '../utils/api/handleApiError';
import { cleanParams } from '../utils/api/cleanParams';
import mainApi from '../config/mainApi';

// Interface for attendee type
export interface AttendeeType {
  id: string;
  name: string;
  description: string;
  background_color: string;
  text_color: string;
  is_active: string;
  nice_is_active: string;
}

// Interface for add attendee parameters
export interface AddAttendeeParams {
  current_user_login_details_id: string;
  ems_secret_code: string;
  attendee_type_id?: string;
  salutation?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  organization?: string;
  designation?: string;
  postal_address?: string;
  status_id?: number;
  attendee_status?: number;
  generate_badge?: number;
  generate_qrcode?: number;
  send_confirmation_mail_ems_yn?: number;
  send_badge_yn?: number;
  send_badge_item?: string;
}

// Interface for update attendee parameters
export interface UpdateAttendeeParams {
  current_user_login_details_id: string;
  attendee_id: string;
  attendee_type_id?: string;
  salutation?: string;
  first_name: string;
  last_name: string;
  email: string;
  email_2?: string;
  phone?: string;
  organization?: string;
  designation?: string;
  country?: string;
  no_of_employees?: string;
  attendance_type?: string;
  postal_address?: string;
  comment?: string;
  session?: string;
  status_id?: number;
  generate_qrcode?: number;
  generate_badge?: number;
  send_badge_yn?: number;
}

// Fetch attendee types
export const fetchAttendeeTypes = async (userId: string) => {
  try {
    const params = cleanParams({
      current_user_login_details_id: userId,
    });

    const response = await mainApi.get(
      '/ajax_get_attendee_type_details/',
      { params }
    );

    if (!response.data || !response.data.status) {
      console.log('Params sent to API:', params);
      console.log('Full API response:', response.data);
      throw new Error(response.data?.message || 'Invalid attendee type data from server');
    }

    return response.data.data as AttendeeType[];
  } catch (error) {
    handleApiError(error, 'Failed to fetch attendee types');
    throw error;
  }
};

// Add attendee
export const addAttendee = async (params: AddAttendeeParams) => {
  try {
    // Ensure required fields are present
    if (!params.current_user_login_details_id) {
      throw new Error('User ID is required');
    }
    
    if (!params.ems_secret_code) {
      throw new Error('Event secret code is required');
    }
    
    if (!params.first_name || !params.last_name) {
      throw new Error('First name and last name are required');
    }
    
    if (!params.email) {
      throw new Error('Email is required');
    }
    
    // Clean params but preserve required fields even if empty
    const cleanedParams = cleanParams({
      current_user_login_details_id: params.current_user_login_details_id,
      ems_secret_code: params.ems_secret_code,
      attendee_type_id: params.attendee_type_id,
      salutation: params.salutation,
      first_name: params.first_name,
      last_name: params.last_name,
      email: params.email,
      phone: params.phone,
      organization: params.organization,
      designation: params.designation,
      postal_address: params.postal_address,
      status_id: params.status_id,
      attendee_status: params.attendee_status,
      
      // Options supplémentaires
      send_confirmation_mail_ems_yn: params.send_confirmation_mail_ems_yn || 0,
      generate_qrcode: params.generate_qrcode || 0,
      generate_badge: params.generate_badge || 1,
      send_badge_yn: params.send_badge_yn || 0,
      send_badge_item: params.send_badge_item || '',
    });
    
    console.log('Params sent to API:', cleanedParams);
    console.log('Request URL:', mainApi.defaults.baseURL + '/add_attendee/');
    
    // Make the API request
    const response = await mainApi.post(
      '/add_attendee/',
      null,
      { params: cleanedParams }
    );
    
    // Log the full response for debugging
    console.log('Full API response:', response);

    if (!response.data || !response.data.status) {
      console.log('API returned error status:', response.data);
      throw new Error(response.data?.message || 'Failed to add attendee');
    }

    return response.data;
  } catch (error: any) {
    // Log detailed error information
    console.log('Error in addAttendee:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log('Error response data:', error.response.data);
      console.log('Error response status:', error.response.status);
      console.log('Error response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.log('Error request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error message:', error.message);
    }
    
    handleApiError(error, 'Failed to add attendee');
    throw error;
  }
};

// Update attendee
export const updateAttendee = async (params: UpdateAttendeeParams) => {
  try {
    // Ensure required fields are present
    if (!params.current_user_login_details_id) {
      throw new Error('User ID is required');
    }
    
    if (!params.attendee_id) {
      throw new Error('Attendee ID is required');
    }
    
    if (!params.first_name || !params.last_name) {
      throw new Error('First name and last name are required');
    }
    
    if (!params.email) {
      throw new Error('Email is required');
    }
    
    // Clean params but preserve required fields even if empty
    const cleanedParams = cleanParams({
      current_user_login_details_id: params.current_user_login_details_id,
      attendee_id: params.attendee_id,
      attendee_type_id: params.attendee_type_id,
      first_name: params.first_name,
      last_name: params.last_name,
      email: params.email,
      email_2: params.email_2 || '',
      phone: params.phone || '',
      full_phone: params.phone || '', // API expects both phone and full_phone
      organization: params.organization || '',
      designation: params.designation || '',
      country: params.country || '',
      no_of_employees: params.no_of_employees || '',
      attendance_type: params.attendance_type || '',
      postal_address: params.postal_address || '',
      comment: params.comment || '',
      session: params.session || '',
      generate_qrcode: params.generate_qrcode || 1,
      generate_badge: params.generate_badge || 1,
      send_badge_yn: params.send_badge_yn || 0,
    });
    
    console.log('Update params sent to API:', cleanedParams);
    console.log('Request URL:', mainApi.defaults.baseURL + '/ajax_update_attendee/');
    
    // Make the API request
    const response = await mainApi.post(
      '/ajax_update_attendee/',
      null,
      { params: cleanedParams }
    );
    
    // Log the full response for debugging
    console.log('Full API update response:', response);

    if (!response.data || !response.data.status) {
      console.log('API returned error status:', response.data);
      throw new Error(response.data?.message || 'Failed to update attendee');
    }

    return response.data;
  } catch (error: any) {
    // Log detailed error information
    console.log('Error in updateAttendee:', error);
    
    if (error.response) {
      console.log('Error response data:', error.response.data);
      console.log('Error response status:', error.response.status);
      console.log('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.log('Error request:', error.request);
    } else {
      console.log('Error message:', error.message);
    }
    
    handleApiError(error, 'Failed to update attendee');
    throw error;
  }
};
