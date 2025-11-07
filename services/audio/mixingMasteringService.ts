/**
 * AI Mixing and Mastering Service
 * Automatic balancing, EQ, compression, and mastering
 */

import type { Effect, Stem } from '../../types/music';

export interface MixingOptions {
  targetLoudness: number; // LUFS (-16 to -8)
  stereoWidth: number; // 0-200%
  depth: 'natural' | 'modern' | 'vintage';
  style: 'transparent' | 'colored' | 'aggressive';
  referenceTrack?: File;
}

export interface MasteringOptions {
  targetFormat: 'streaming' | 'cd' | 'vinyl' | 'club';
  loudnessTarget: number; // LUFS
  ceilingLimit: number; // dB
  enhanceBass: boolean;
  enhanceHighs: boolean;
  addAnalogWarmth: boolean;
}

export interface AudioEffectParams {
  reverb?: {
    roomSize: number; // 0-100
    damping: number; // 0-100
    wet: number; // 0-100
  };
  delay?: {
    time: number; // milliseconds
    feedback: number; // 0-100
    wet: number; // 0-100
  };
  eq?: {
    low: number; // -12 to +12 dB
    mid: number;
    high: number;
    lowFreq?: number; // Hz
    midFreq?: number;
    highFreq?: number;
  };
  compressor?: {
    threshold: number; // dB
    ratio: number; // 1:1 to 20:1
    attack: number; // ms
    release: number; // ms
    makeupGain: number; // dB
  };
  distortion?: {
    amount: number; // 0-100
    type: 'soft' | 'hard' | 'tube' | 'fuzz';
  };
}

export class MixingMasteringService {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiUrl = process.env.VITE_MIXING_API_URL || 'https://api.aimix.studio';
    this.apiKey = apiKey;
  }

  /**
   * Automatic AI mixing of multiple stems
   */
  async autoMix(stems: Stem[], options: MixingOptions): Promise<string> {
    const formData = new FormData();

    // Add all stem audio files
    for (const stem of stems) {
      const stemData = {
        type: stem.type,
        volume: stem.volume,
        pan: stem.pan,
        audioUrl: stem.audioUrl,
      };
      formData.append('stems', JSON.stringify(stemData));
    }

    formData.append('options', JSON.stringify(options));

    try {
      const response = await fetch(`${this.apiUrl}/auto-mix`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Auto mix failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.audioUrl;
    } catch (error) {
      console.error('Auto mix error:', error);
      throw error;
    }
  }

  /**
   * Master final mix
   */
  async masterTrack(audioFile: File, options: MasteringOptions): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('options', JSON.stringify(options));

    try {
      const response = await fetch(`${this.apiUrl}/master`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Mastering failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.audioUrl;
    } catch (error) {
      console.error('Mastering error:', error);
      throw error;
    }
  }

  /**
   * Apply effect to audio
   */
  async applyEffect(
    audioFile: File,
    effectType: Effect['type'],
    params: AudioEffectParams
  ): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('effectType', effectType);
    formData.append('params', JSON.stringify(params));

    try {
      const response = await fetch(`${this.apiUrl}/apply-effect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Apply effect failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.audioUrl;
    } catch (error) {
      console.error('Apply effect error:', error);
      throw error;
    }
  }

  /**
   * Balance mix with reference track
   */
  async matchReference(
    audioFile: File,
    referenceFile: File
  ): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('reference', referenceFile);

    try {
      const response = await fetch(`${this.apiUrl}/match-reference`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Reference matching failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.audioUrl;
    } catch (error) {
      console.error('Reference matching error:', error);
      throw error;
    }
  }

  /**
   * Analyze mix quality
   */
  async analyzeMix(audioFile: File): Promise<{
    loudness: number;
    dynamicRange: number;
    stereoWidth: number;
    frequencyBalance: {
      bass: number;
      mids: number;
      highs: number;
    };
    suggestions: string[];
  }> {
    const formData = new FormData();
    formData.append('audio', audioFile);

    try {
      const response = await fetch(`${this.apiUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Mix analysis failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Mix analysis error:', error);
      throw error;
    }
  }

  /**
   * Remove background noise
   */
  async removeNoise(audioFile: File, intensity: number = 50): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('intensity', intensity.toString());

    try {
      const response = await fetch(`${this.apiUrl}/denoise`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Noise removal failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.audioUrl;
    } catch (error) {
      console.error('Noise removal error:', error);
      throw error;
    }
  }

  /**
   * Normalize audio levels
   */
  async normalize(audioFile: File, targetLevel: number = -14): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('targetLevel', targetLevel.toString());

    try {
      const response = await fetch(`${this.apiUrl}/normalize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Normalization failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.audioUrl;
    } catch (error) {
      console.error('Normalization error:', error);
      throw error;
    }
  }

  /**
   * Create crossfade between two tracks
   */
  async createCrossfade(
    track1: File,
    track2: File,
    duration: number
  ): Promise<string> {
    const formData = new FormData();
    formData.append('track1', track1);
    formData.append('track2', track2);
    formData.append('duration', duration.toString());

    try {
      const response = await fetch(`${this.apiUrl}/crossfade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Crossfade creation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.audioUrl;
    } catch (error) {
      console.error('Crossfade error:', error);
      throw error;
    }
  }
}

// Export singleton
let mixingService: MixingMasteringService | null = null;

export const initMixingService = (apiKey: string) => {
  mixingService = new MixingMasteringService(apiKey);
  return mixingService;
};

export const getMixingService = (): MixingMasteringService => {
  if (!mixingService) {
    throw new Error('MixingMasteringService not initialized.');
  }
  return mixingService;
};
