// Authentication related types

export interface UserInfo {
  current_user_login_details_id: string;
  user_type_name: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  // Add other user properties as needed
}

export interface AuthState {
  currentUserId: string | null;
  userType: string | null;
  userInfo: UserInfo | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: boolean;
  message?: string;
  user_details: UserInfo;
  // Add other response properties as needed
}
