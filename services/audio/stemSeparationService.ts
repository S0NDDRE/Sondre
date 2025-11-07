/**
 * Stem Separation Service
 * Separates audio into individual tracks (vocals, drums, bass, etc.)
 * Uses advanced models: Phoenix, Orion, Perseus
 */

import type { Stem, StemType } from '../../types/music';

export interface StemSeparationOptions {
  model: 'phoenix' | 'orion' | 'perseus';
  numberOfStems: 2 | 4 | 8 | 12;
  quality: 'fast' | 'balanced' | 'high';
}

export class StemSeparationService {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiUrl = process.env.VITE_STEM_SEPARATION_API_URL || 'https://api.stemify.ai';
    this.apiKey = apiKey;
  }

  /**
   * Separate audio file into individual stems
   */
  async separateStems(
    audioFile: File,
    options: StemSeparationOptions
  ): Promise<Stem[]> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('model', options.model);
    formData.append('numberOfStems', options.numberOfStems.toString());
    formData.append('quality', options.quality);

    try {
      const response = await fetch(`${this.apiUrl}/separate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Stem separation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformToStems(data.stems);
    } catch (error) {
      console.error('Stem separation error:', error);
      throw error;
    }
  }

  /**
   * Separate using Phoenix model (12+ stems)
   */
  async separateWithPhoenix(audioFile: File): Promise<Stem[]> {
    return this.separateStems(audioFile, {
      model: 'phoenix',
      numberOfStems: 12,
      quality: 'high',
    });
  }

  /**
   * Quick 4-stem separation (vocals, drums, bass, other)
   */
  async quickSeparate(audioFile: File): Promise<Stem[]> {
    return this.separateStems(audioFile, {
      model: 'orion',
      numberOfStems: 4,
      quality: 'fast',
    });
  }

  /**
   * Extract specific stem type
   */
  async extractStem(audioFile: File, stemType: StemType): Promise<Stem> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('stemType', stemType);

    try {
      const response = await fetch(`${this.apiUrl}/extract`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Stem extraction failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformToStem(data, stemType);
    } catch (error) {
      console.error('Stem extraction error:', error);
      throw error;
    }
  }

  /**
   * Isolate vocals from audio
   */
  async isolateVocals(audioFile: File): Promise<{ vocals: Stem; instrumental: Stem }> {
    try {
      const response = await fetch(`${this.apiUrl}/isolate-vocals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: (() => {
          const formData = new FormData();
          formData.append('audio', audioFile);
          return formData;
        })(),
      });

      if (!response.ok) {
        throw new Error(`Vocal isolation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        vocals: this.transformToStem(data.vocals, 'vocals'),
        instrumental: this.transformToStem(data.instrumental, 'drums'), // placeholder type
      };
    } catch (error) {
      console.error('Vocal isolation error:', error);
      throw error;
    }
  }

  /**
   * Get separation status
   */
  async getSeparationStatus(jobId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    stems?: Stem[];
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/status/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        status: data.status,
        progress: data.progress || 0,
        stems: data.stems ? this.transformToStems(data.stems) : undefined,
      };
    } catch (error) {
      console.error('Status check error:', error);
      throw error;
    }
  }

  /**
   * Transform API response to Stem
   */
  private transformToStem(data: any, type: StemType): Stem {
    return {
      id: data.id || this.generateId(),
      type,
      audioUrl: data.audioUrl || data.url,
      volume: data.volume || 80,
      pan: data.pan || 0,
      solo: false,
      mute: false,
      effects: [],
    };
  }

  /**
   * Transform API response to Stems array
   */
  private transformToStems(data: any[]): Stem[] {
    return data.map((stem) =>
      this.transformToStem(stem, stem.type as StemType)
    );
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `stem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton
let stemService: StemSeparationService | null = null;

export const initStemService = (apiKey: string) => {
  stemService = new StemSeparationService(apiKey);
  return stemService;
};

export const getStemService = (): StemSeparationService => {
  if (!stemService) {
    throw new Error('StemSeparationService not initialized.');
  }
  return stemService;
};
