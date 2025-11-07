export interface WatermarkSelection {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'manual' | 'auto';
}

export interface MediaFile {
  file: File;
  type: 'image' | 'video';
  url: string;
  width: number;
  height: number;
  duration?: number; // for videos
}

export interface ProcessingStatus {
  isProcessing: boolean;
  progress: number;
  stage: 'uploading' | 'detecting' | 'removing' | 'exporting' | 'complete' | 'idle';
  error?: string;
}

export interface ExportOptions {
  format: 'png' | 'jpg' | 'webp' | 'mp4';
  quality: number; // 0-100
}

export type SelectionMode = 'manual' | 'auto';
export type ToolMode = 'select' | 'pan' | 'zoom';
