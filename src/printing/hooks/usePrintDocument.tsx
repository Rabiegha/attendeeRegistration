/**
 * Hook for printing documents using PrintNode service
 */
import { useCallback, useState } from 'react';
import { useNodePrint } from './useNodePrint';
import { usePrintStatus } from '../context/PrintStatusContext';
import { store } from '../../redux/store';

// Import types from the types file
import { 
  RootState, 
  PrintDocumentHook, 
  PrintDocumentState 
} from '../types/printerTypes';

// Import utilities from the utils file
import { 
  fetchDocumentAsBase64
} from '../utils/printUtils';
import { Buffer } from 'buffer';

// Helper function for creating delays
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Clean base64 string to ensure proper formatting
const cleanBase64 = (base64: string): string => {
  return Buffer.from(Buffer.from(base64, 'base64')).toString('base64');
};

// Simple logger implementation
const logger = {
  log: (...args: any[]) => {
    if (__DEV__) {
      console.log('[PrintDocument]', ...args);
    }
  },
  error: (...args: any[]) => {
    if (__DEV__) {
      console.error('[PrintDocument]', ...args);
    }
  }
};

/**
 * Hook for printing documents
 * @returns Object with print functions and state
 */
const usePrintDocument = (): PrintDocumentHook => {
  const { sendPrintJob } = useNodePrint();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const { status: printStatus, setStatus, clearStatus } = usePrintStatus();

  /**
   * Print a document
   * @param documentUrl - URL of the document to print
   * @param printerId - Optional printer ID to use
   * @param useStoreId - Whether to use the printer ID from the Redux store
   */
  const printDocument = useCallback(async (
    documentUrl: string, 
    printerId?: string, 
    useStoreId: boolean = false
  ): Promise<void> => {
    // Reset state
    setLoading(true);
    setError(null);
    setMessage('');
    setSuccess(false);
    setStatus('printing');
    
    // Get printer ID from store if requested and not provided directly
    const storeState = store.getState() as RootState;
    const selectedPrinter = storeState.printers.selectedNodePrinter;
    const effectivePrinterId = useStoreId && selectedPrinter ? 
      selectedPrinter.id : 
      printerId;
      
    logger.log('Selected printer:', effectivePrinterId);
    
    try {
      if (!effectivePrinterId) {
        setStatus('no_printer');
        throw new Error('Aucune imprimante sélectionnée.');
      }
      
      // Fetch and convert document to base64
      const base64 = await fetchDocumentAsBase64(documentUrl, (status, errorMsg) => {
        setStatus(status as any);
        throw new Error(errorMsg);
      });

      // Clean the base64 string to ensure it's properly formatted
      const cleanedBase64 = cleanBase64(base64);

      // Send the print job
      await sendPrintJob(cleanedBase64, effectivePrinterId);

      // Handle success
      await delay(1000);
      logger.log('[printDocument] documentUrl:', documentUrl, 'sent to', selectedPrinter?.name || 'unknown printer');
      setSuccess(true);
      setStatus('success');
      setMessage('Document imprimé avec succès.');
    } catch (err: unknown) {
      // Handle error
      await delay(1000);
      const msg = err instanceof Error ? 
        err.message : 
        'Erreur inconnue lors de l\'impression.';
        
      logger.error('[printDocument] error:', msg);
      setError(msg);
      setMessage(msg);
      
      // Set appropriate error status
      setTimeout(() => {
        setStatus('unknown_error');
      }, 100);
    } finally {
      setLoading(false);
    }
  }, [sendPrintJob, setStatus]);

  return {
    printDocument,
    loading,
    error,
    message,
    success,
    printStatus,
  };
};

export default usePrintDocument;
