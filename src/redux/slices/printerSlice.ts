import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define printer interfaces
export interface PrinterOptions {
  paperFormat: string | null;
  orientation: 'portrait' | 'landscape';
  dpi: number;
  color: boolean;
  duplex: 'none' | 'long-edge' | 'short-edge' | 'unsupported';
  copies: number;
}

export interface Printer {
  id: string;
  name: string;
  state: 'online' | 'offline';
  description?: string;
  capabilities?: {
    color?: boolean;
    duplex?: boolean;
    paperFormats?: string[];
  };
}

interface PrinterState {
  selectedNodePrinter: Printer | null;
  printStatus: string;
  highQuality: boolean;
  selectedOptions: PrinterOptions;
}

const initialState: PrinterState = {
  selectedNodePrinter: null,
  printStatus: '',
  highQuality: true,
  selectedOptions: {
    paperFormat: null,
    orientation: 'portrait',
    dpi: 600,
    color: true,
    duplex: 'none',
    copies: 1,
  },
};

// Async thunks
export const selectNodePrinterAsync = createAsyncThunk(
  'printers/selectNodePrinterAsync',
  async (printer: Printer, { dispatch }) => {
    // Simulate async delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Dispatch synchronous action
    dispatch(selectNodePrinter(printer));
  },
);

export const deselectNodePrinterAsync = createAsyncThunk(
  'printers/deselectNodePrinterAsync',
  async (_, { dispatch }) => {
    // Simulate async delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Dispatch synchronous action
    dispatch(deselectNodePrinter());
  },
);

const printerSlice = createSlice({
  name: 'printers',
  initialState,
  reducers: {
    // Printer selection actions
    selectNodePrinter: (state, action: PayloadAction<Printer>) => {
      const printer = action.payload;
      state.selectedNodePrinter = printer;
      state.printStatus = '';

      // Determine the default paper format based on printer capabilities
      const defaultPaperFormat =
        printer.capabilities?.paperFormats?.[0] || 'A4';

      // Reset options when selecting a new printer
      state.selectedOptions = {
        paperFormat: defaultPaperFormat,
        orientation: 'portrait',
        dpi: state.highQuality ? 600 : 300,
        color: printer.capabilities?.color || false,
        duplex: printer.capabilities?.duplex ? 'none' : 'unsupported',
        copies: 1,
      };
    },
    deselectNodePrinter: (state) => {
      state.selectedNodePrinter = null;
      state.printStatus = '';
    },
    
    // Print status actions
    setPrintStatus: (state, action: PayloadAction<string>) => {
      state.printStatus = action.payload;
    },
    
    // Printer settings actions
    setHighQuality: (state, action: PayloadAction<boolean>) => {
      state.highQuality = action.payload;
      // Update DPI based on quality setting
      state.selectedOptions.dpi = action.payload ? 600 : 300;
    },
    
    // Print options actions
    setOption: (state, action: PayloadAction<{ optionName: keyof PrinterOptions; value: unknown }>) => {
      const { optionName, value } = action.payload;
      if (optionName in state.selectedOptions) {
        // Type assertion to handle the type safely
        (state.selectedOptions as any)[optionName] = value;
      }
    },
    
    resetStore: () => initialState,
  },
});

export const {
  selectNodePrinter,
  deselectNodePrinter,
  setPrintStatus,
  setHighQuality,
  setOption,
  resetStore,
} = printerSlice.actions;

export default printerSlice.reducer;
