/**
 * Type definitions for printing functionality
 */

// Define printer types
export interface PrinterCapabilities {
  color: boolean;
  duplex: boolean;
  papers: Record<string, unknown>;
  paperFormats?: string[];
}

export interface Printer {
  id: string;
  name: string;
  capabilities: PrinterCapabilities;
}

// Define Redux state types
export interface PrintersState {
  selectedNodePrinter: Printer | null;
  printStatus: string;
  highQuality: boolean;
  selectedOptions: {
    paperFormat: string | null;
    orientation: string;
    dpi: number;
    color: boolean;
    duplex: string;
    copies: number;
  };
}

export interface RootState {
  printers: PrintersState;
}

export interface PrintDocumentState {
  loading: boolean;
  error: string | null;
  message: string;
  success: boolean;
  printStatus: null | keyof typeof import('../constants/printStatusConfig').printStatusConfig;
}

export interface PrintDocumentHook extends PrintDocumentState {
  printDocument: (documentUrl: string, printerId?: string, useStoreId?: boolean) => Promise<void>;
}
