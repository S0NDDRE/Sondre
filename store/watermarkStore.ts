import { create } from 'zustand';
import { MediaFile, WatermarkSelection, ProcessingStatus, ExportOptions, SelectionMode, ToolMode } from '../types/watermark';

interface WatermarkState {
  // Media
  mediaFile: MediaFile | null;
  processedMediaUrl: string | null;

  // Selection
  selections: WatermarkSelection[];
  currentSelection: WatermarkSelection | null;
  selectionMode: SelectionMode;
  toolMode: ToolMode;

  // Processing
  processingStatus: ProcessingStatus;

  // Export
  exportOptions: ExportOptions;

  // Chat
  isChatOpen: boolean;

  // Actions
  setMediaFile: (file: MediaFile | null) => void;
  setProcessedMediaUrl: (url: string | null) => void;
  addSelection: (selection: WatermarkSelection) => void;
  removeSelection: (index: number) => void;
  clearSelections: () => void;
  setCurrentSelection: (selection: WatermarkSelection | null) => void;
  setSelectionMode: (mode: SelectionMode) => void;
  setToolMode: (mode: ToolMode) => void;
  setProcessingStatus: (status: Partial<ProcessingStatus>) => void;
  setExportOptions: (options: Partial<ExportOptions>) => void;
  toggleChat: () => void;
  reset: () => void;
}

const initialProcessingStatus: ProcessingStatus = {
  isProcessing: false,
  progress: 0,
  stage: 'idle',
};

const initialExportOptions: ExportOptions = {
  format: 'png',
  quality: 95,
};

export const useWatermarkStore = create<WatermarkState>((set) => ({
  mediaFile: null,
  processedMediaUrl: null,
  selections: [],
  currentSelection: null,
  selectionMode: 'manual',
  toolMode: 'select',
  processingStatus: initialProcessingStatus,
  exportOptions: initialExportOptions,
  isChatOpen: false,

  setMediaFile: (file) => set({ mediaFile: file }),
  setProcessedMediaUrl: (url) => set({ processedMediaUrl: url }),
  addSelection: (selection) => set((state) => ({
    selections: [...state.selections, selection],
  })),
  removeSelection: (index) => set((state) => ({
    selections: state.selections.filter((_, i) => i !== index),
  })),
  clearSelections: () => set({ selections: [] }),
  setCurrentSelection: (selection) => set({ currentSelection: selection }),
  setSelectionMode: (mode) => set({ selectionMode: mode }),
  setToolMode: (mode) => set({ toolMode: mode }),
  setProcessingStatus: (status) => set((state) => ({
    processingStatus: { ...state.processingStatus, ...status },
  })),
  setExportOptions: (options) => set((state) => ({
    exportOptions: { ...state.exportOptions, ...options },
  })),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  reset: () => set({
    mediaFile: null,
    processedMediaUrl: null,
    selections: [],
    currentSelection: null,
    selectionMode: 'manual',
    toolMode: 'select',
    processingStatus: initialProcessingStatus,
    exportOptions: initialExportOptions,
    isChatOpen: false,
  }),
}));
