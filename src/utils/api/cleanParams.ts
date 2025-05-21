/**
 * Removes undefined, null, and empty string values from an object
 * Useful for API requests to avoid sending unnecessary parameters
 * @param params Object containing parameters
 * @returns Cleaned object with only valid parameters
 */
export const cleanParams = (params: Record<string, any>): Record<string, any> => {
  const cleanedParams: Record<string, any> = {};
  
  Object.entries(params).forEach(([key, value]) => {
    // Only include defined, non-null values that aren't empty strings
    if (value !== undefined && value !== null && value !== '') {
      cleanedParams[key] = value;
    }
  });
  
  return cleanedParams;
};
