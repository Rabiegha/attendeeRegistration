import { RootState } from '../../store';

// Auth selectors
export const selectIsLoggedIn = (state: RootState) => !!state.auth.currentUserId;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectUserInfo = (state: RootState) => state.auth.userInfo;
export const selectCurrentUserId = (state: RootState) => state.auth.currentUserId;
export const selectUserType = (state: RootState) => state.auth.userType;
export const selectError = (state: RootState) => state.auth.error;
