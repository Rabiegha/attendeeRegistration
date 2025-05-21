import { RootState } from '../../../printing/types/printerTypes';

// Selectors for printer state
export const selectSelectedNodePrinter = (state: RootState) => state.printers.selectedNodePrinter;
export const selectPrintStatus = (state: RootState) => state.printers.printStatus;
export const selectHighQuality = (state: RootState) => state.printers.highQuality;
export const selectPaperFormat = (state: RootState) => state.printers.selectedOptions.paperFormat;
export const selectOrientation = (state: RootState) => state.printers.selectedOptions.orientation;
export const selectDpi = (state: RootState) => state.printers.selectedOptions.dpi;
export const selectColor = (state: RootState) => state.printers.selectedOptions.color;
export const selectDuplex = (state: RootState) => state.printers.selectedOptions.duplex;
export const selectCopies = (state: RootState) => state.printers.selectedOptions.copies;
