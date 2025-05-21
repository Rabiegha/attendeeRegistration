/**
 * Hook for handling print jobs with PrintNode service
 */
import { useDispatch, useSelector } from 'react-redux';
import { sendPrintJob as sendPrintService } from '../../services/printNodeService';
import { setPrintStatus } from '../../redux/slices/printerSlice';
import { AppDispatch } from '../../redux/store';

// Simple logger implementation
const logger = {
  log: (...args: any[]) => {
    if (__DEV__) {
      console.log('[NodePrint]', ...args);
    }
  },
  error: (...args: any[]) => {
    if (__DEV__) {
      console.error('[NodePrint]', ...args);
    }
  }
};

// Define interfaces for type safety
interface PrintJobOptions {
  copies: number;
  color: boolean;
  dpi: string;
  orientation: string;
  pageRanges: string;
  pages: number;
  sizing: string;
}

interface PrintJob {
  printerId: string;
  title: string;
  contentType: string;
  content: string;
  source: string;
  options: PrintJobOptions;
}

/**
 * Hook for interacting with the PrintNode service
 * @returns Object containing the sendPrintJob function
 */
export const useNodePrint = () => {
  // Get printer settings from Redux store
  const { selectedOptions, highQuality } = useSelector((state: any) => state.printers);
  const orientation = selectedOptions?.orientation || 'portrait';
  const dpi = highQuality ? 600 : 300;
  const selectedPaperFormat = selectedOptions?.paperFormat || 'A4';
  const dispatch = useDispatch<AppDispatch>();

  /**
   * Send a print job to the PrintNode service
   * @param fileBase64 - Base64 encoded file content
   * @param printerId - ID of the printer to use
   * @returns Promise that resolves when the print job is sent
   */
  const sendPrintJob = async (fileBase64: string, printerId: string): Promise<void> => {
    try {
      if (!printerId) {
        logger.error('No printer selected');
        dispatch(setPrintStatus('No printer selected'));
        return;
      }
      
      logger.log('Sending print job to printer:', printerId);

      console.log('Selected paper format:', selectedPaperFormat);

      // Create print job options
      const printOptions: PrintJobOptions = {
        copies: selectedOptions?.copies || 1,
        color: selectedOptions?.color !== false, // Default to color if not specified
        dpi: dpi.toString(),
        orientation: orientation,
        pageRanges: '',
        pages: 0,
        sizing: 'fit',
      };

      // Configure the print job
      const printJob: PrintJob = {
        printerId,
        title: 'Badge Printing',
        contentType: 'pdf_base64',
        content: fileBase64,
        source: 'Attendee Registration App',
        options: printOptions,
      };

      // Send the print job to the PrintNode service
      await sendPrintService(printJob);
      dispatch(setPrintStatus('Print job sent successfully'));
    } catch (error: unknown) {
      logger.error('Error sending print job:', error);
      dispatch(setPrintStatus('Print failed'));
      
      // Safely handle error object
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorResponse = error && typeof error === 'object' && 'response' in error ? 
        (error as any).response?.data : errorMessage;
      
      console.error("Error sending print job:", errorResponse);
      throw error; // Re-throw to allow handling in the calling function
    }
  };

  return {
    sendPrintJob,
  };
};
