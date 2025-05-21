/**
 * Utility functions for printing
 */
import { Buffer } from 'buffer';
import RNFS from 'react-native-fs';

/**
 * Create a delay using a promise
 * @param ms - Milliseconds to delay
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Convert ArrayBuffer to base64 string
 * @param buffer - The ArrayBuffer to convert
 * @returns Base64 string representation
 */
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  return Buffer.from(buffer).toString('base64');
};

/**
 * Clean base64 string to ensure proper formatting
 * @param base64 - The base64 string to clean
 * @returns Cleaned base64 string
 */
export const cleanBase64 = (base64: string): string => {
  return Buffer.from(Buffer.from(base64, 'base64')).toString('base64');
};

/**
 * Fetch a document and convert it to base64
 * @param url - URL of the document to fetch
 * @param onError - Error callback function
 * @returns Promise resolving to base64 string
 */
export const fetchDocumentAsBase64 = async (
  url: string, 
  onError?: (status: string, message: string) => void
): Promise<string> => {
  if (url.startsWith('file://')) {
    const localPath = url.replace('file://', '');
    return await RNFS.readFile(localPath, 'base64');
  }

  try {
    console.log('Fetching document from URL:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to retrieve document: ${response.statusText} (${response.status})`);
    }
    
    const buffer = await response.arrayBuffer();
    console.log('Document fetched successfully, converting to base64');
    return arrayBufferToBase64(buffer);
  } catch (fetchErr: unknown) {
    console.error('Error fetching document:', fetchErr);
    
    if (onError) {
      onError('fetch_failed', 
        fetchErr instanceof Error ? 
          fetchErr.message : 
          'Network error while retrieving the PDF.'
      );
    }
    
    throw new Error(
      fetchErr instanceof Error ? 
        fetchErr.message : 
        'Network error while retrieving the PDF.'
    );
  }
};

/**
 * Logger utility that only logs in development mode
 */
export const logger = {
  log(...args: unknown[]): void {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[Print]', ...args);
    }
  },
  error(...args: unknown[]): void {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.error('[Print]', ...args);
    } else {
      // Always log errors even in production, but without the debug prefix
      console.error(...args);
    }
  }
};
