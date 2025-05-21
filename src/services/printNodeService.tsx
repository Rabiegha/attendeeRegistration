import printNode from '../config/printNodeApi';

/**
 * Helper function to handle API errors consistently
 */
const handleApiError = (error: any, defaultMessage: string) => {
  console.error(defaultMessage, error);
  
  // Extract error details if available
  const errorResponse = error?.response?.data;
  const errorMessage = errorResponse?.message || defaultMessage;
  
  // Create an error object with additional context
  const enhancedError = new Error(errorMessage);
  (enhancedError as any).response = error?.response;
  (enhancedError as any).originalError = error;
  
  return enhancedError;
};

/**
 * Get available printers from PrintNode
 * @returns Promise that resolves to an array of printer objects
 */
export const getNodePrinters = async () => {
  try {
    const response = await printNode.get('/printers');
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch printers');
  }
};

/**
 * Send a print job to PrintNode
 * @param printJob - Object containing print job details
 * @returns Promise that resolves to the print job response
 */
export const sendPrintJob = async (printJob: any) => {
  try {
    console.log('Sending print job to PrintNode:', JSON.stringify(printJob, null, 2));
    const response = await printNode.post('/printjobs', printJob);
    console.log('Print job response:', response.data);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to send print job');
  }
};
