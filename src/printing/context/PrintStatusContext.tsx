import React, { createContext, useContext, useState, ReactNode } from 'react';
import { printStatusConfig } from '../constants/printStatusConfig';

// Define types for the context
export type PrintStatus = keyof typeof printStatusConfig | null;

interface PrintStatusContextType {
  status: PrintStatus;
  setStatus: (status: PrintStatus) => void;
  clearStatus: () => void;
}

// Create context with proper typing and default values
const PrintStatusContext = createContext<PrintStatusContextType | null>(null);

interface PrintStatusProviderProps {
  children: ReactNode;
}

export const PrintStatusProvider = ({ children }: PrintStatusProviderProps) => {
  const [status, setStatus] = useState<PrintStatus>(null);

  const clearStatus = () => setStatus(null);

  return (
    <PrintStatusContext.Provider value={{ status, setStatus, clearStatus }}>
      {children}
    </PrintStatusContext.Provider>
  );
};

export const usePrintStatus = (): PrintStatusContextType => {
  const context = useContext(PrintStatusContext);
  
  if (!context) {
    throw new Error('usePrintStatus must be used within a PrintStatusProvider');
  }
  
  return context;
};
