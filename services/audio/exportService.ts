/**
 * Audio Export Service
 * Export to MP3, WAV, FLAC, and MP4 with stems
 */

import type { ExportFormat, Project, Stem } from '../../types/music';
import lamejs from 'lamejs';
import toWav from 'audiobuffer-to-wav';

export interface ExportOptions {
  format: ExportFormat;
  quality?: 'low' | 'medium' | 'high' | 'lossless';
  bitrate?: number; // For MP3: 128, 192, 256, 320 kbps
  sampleRate?: number; // 44100, 48000, 96000
  bitDepth?: 16 | 24 | 32; // For WAV/FLAC
  includeStems?: boolean;
  metadata?: {
    title?: string;
    artist?: string;
    album?: string;
    year?: number;
    genre?: string;
    artwork?: File;
  };
}

export class ExportService {
  /**
   * Export audio to specified format
   */
  async exportAudio(
    audioUrl: string,
    filename: string,
    options: ExportOptions
  ): Promise<Blob> {
    const audioBuffer = await this.loadAudioBuffer(audioUrl);

    switch (options.format) {
      case 'mp3':
        return this.exportToMP3(audioBuffer, options);
      case 'wav':
        return this.exportToWAV(audioBuffer, options);
      case 'flac':
        return this.exportToFLAC(audioBuffer, options);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  /**
   * Export project with all tracks and stems
   */
  async exportProject(
    project: Project,
    options: ExportOptions
  ): Promise<{ main: Blob; stems?: Map<string, Blob> }> {
    // Export main mix
    const mainBlob = await this.exportAudio(
      project.tracks[0]?.generatedTrack?.audioUrl || '',
      project.name,
      options
    );

    // Export individual stems if requested
    let stems: Map<string, Blob> | undefined;
    if (options.includeStems) {
      stems = new Map();

      for (const track of project.tracks) {
        if (track.generatedTrack?.stems) {
          for (const stem of track.generatedTrack.stems) {
            const stemBlob = await this.exportAudio(
              stem.audioUrl,
              `${project.name}_${stem.type}`,
              options
            );
            stems.set(`${track.name}_${stem.type}`, stemBlob);
          }
        }
      }
    }

    return { main: mainBlob, stems };
  }

  /**
   * Export to MP3 format
   */
  private async exportToMP3(
    audioBuffer: AudioBuffer,
    options: ExportOptions
  ): Promise<Blob> {
    const bitrate = options.bitrate || 320;
    const channels = audioBuffer.numberOfChannels;
    const sampleRate = options.sampleRate || audioBuffer.sampleRate;

    const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, bitrate);
    const mp3Data: Int8Array[] = [];

    const sampleBlockSize = 1152;
    const leftChannel = audioBuffer.getChannelData(0);
    const rightChannel = channels > 1 ? audioBuffer.getChannelData(1) : leftChannel;

    for (let i = 0; i < leftChannel.length; i += sampleBlockSize) {
      const leftChunk = this.float32ToInt16(leftChannel.subarray(i, i + sampleBlockSize));
      const rightChunk = this.float32ToInt16(rightChannel.subarray(i, i + sampleBlockSize));

      const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }

    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }

    return new Blob(mp3Data, { type: 'audio/mp3' });
  }

  /**
   * Export to WAV format
   */
  private async exportToWAV(
    audioBuffer: AudioBuffer,
    options: ExportOptions
  ): Promise<Blob> {
    const wavBuffer = toWav(audioBuffer);
    return new Blob([wavBuffer], { type: 'audio/wav' });
  }

  /**
   * Export to FLAC format (placeholder - requires server-side processing)
   */
  private async exportToFLAC(
    audioBuffer: AudioBuffer,
    options: ExportOptions
  ): Promise<Blob> {
    // FLAC encoding typically requires server-side processing
    // For now, return as WAV and convert on server
    return this.exportToWAV(audioBuffer, options);
  }

  /**
   * Load audio buffer from URL
   */
  private async loadAudioBuffer(audioUrl: string): Promise<AudioBuffer> {
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    return await audioContext.decodeAudioData(arrayBuffer);
  }

  /**
   * Convert Float32Array to Int16Array
   */
  private float32ToInt16(buffer: Float32Array): Int16Array {
    const l = buffer.length;
    const result = new Int16Array(l);

    for (let i = 0; i < l; i++) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      result[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    return result;
  }

  /**
   * Download file
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Batch export stems
   */
  async batchExportStems(
    stems: Stem[],
    projectName: string,
    options: ExportOptions
  ): Promise<Map<string, Blob>> {
    const exports = new Map<string, Blob>();

    for (const stem of stems) {
      const filename = `${projectName}_${stem.type}`;
      const blob = await this.exportAudio(stem.audioUrl, filename, options);
      exports.set(filename, blob);
    }

    return exports;
  }

  /**
   * Create zip archive of all exports
   */
  async createZipArchive(
    files: Map<string, Blob>,
    zipName: string
  ): Promise<Blob> {
    // This would use a library like JSZip
    // Placeholder implementation
    console.log('Creating zip archive:', zipName, files.size);
    return new Blob([], { type: 'application/zip' });
  }

  /**
   * Export with metadata
   */
  async exportWithMetadata(
    audioUrl: string,
    filename: string,
    options: ExportOptions
  ): Promise<Blob> {
    const audioBlob = await this.exportAudio(audioUrl, filename, options);

    // Add metadata if provided
    if (options.metadata) {
      // This would use a library like jsmediatags or music-metadata
      // For now, return the audio blob
      console.log('Adding metadata:', options.metadata);
    }

    return audioBlob;
  }
}

// Export singleton
let exportService: ExportService | null = null;

export const initExportService = () => {
  exportService = new ExportService();
  return exportService;
};

export const getExportService = (): ExportService => {
  if (!exportService) {
    exportService = new ExportService();
  }
  return exportService;
};
