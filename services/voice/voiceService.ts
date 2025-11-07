/**
 * Voice AI and Cloning Service
 * Handles voice synthesis, cloning, and voice-to-instrument conversion
 */

import type { CustomVoice, VoiceCloneRequest, VoiceType } from '../../types/music';

export interface VoiceSynthesisOptions {
  text?: string;
  lyrics?: string;
  language: string;
  voiceType: VoiceType | 'custom';
  customVoiceId?: string;
  pitch?: number; // -12 to +12 semitones
  speed?: number; // 0.5 to 2.0
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'passionate';
}

export interface VoiceToInstrumentOptions {
  targetInstrument: 'saxophone' | 'guitar' | 'piano' | 'synth' | 'violin' | 'flute';
  preserveExpression: boolean;
}

export class VoiceService {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiUrl = process.env.VITE_VOICE_API_URL || 'https://api.voiceai.studio';
    this.apiKey = apiKey;
  }

  /**
   * Synthesize vocals from text/lyrics
   */
  async synthesizeVocals(options: VoiceSynthesisOptions): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error(`Voice synthesis failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.audioUrl;
    } catch (error) {
      console.error('Voice synthesis error:', error);
      throw error;
    }
  }

  /**
   * Clone voice from audio sample (3-60 seconds)
   */
  async cloneVoice(request: VoiceCloneRequest): Promise<CustomVoice> {
    const formData = new FormData();
    formData.append('audio', request.audioSample);
    formData.append('name', request.name);
    formData.append('language', request.language);

    try {
      const response = await fetch(`${this.apiUrl}/clone`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Voice cloning failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        name: request.name,
        voiceId: data.voiceId,
        language: request.language,
        sampleUrl: data.sampleUrl,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Voice cloning error:', error);
      throw error;
    }
  }

  /**
   * Convert voice/humming to instrument
   */
  async voiceToInstrument(
    audioFile: File,
    options: VoiceToInstrumentOptions
  ): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('instrument', options.targetInstrument);
    formData.append('preserveExpression', options.preserveExpression.toString());

    try {
      const response = await fetch(`${this.apiUrl}/voice-to-instrument`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Voice to instrument conversion failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.audioUrl;
    } catch (error) {
      console.error('Voice to instrument error:', error);
      throw error;
    }
  }

  /**
   * Apply pitch correction to vocals
   */
  async applyPitchCorrection(
    audioFile: File,
    options: {
      key?: string;
      scale?: 'major' | 'minor' | 'chromatic';
      strength?: number; // 0-100
      preserveVibrato?: boolean;
    }
  ): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('options', JSON.stringify(options));

    try {
      const response = await fetch(`${this.apiUrl}/pitch-correction`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Pitch correction failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.audioUrl;
    } catch (error) {
      console.error('Pitch correction error:', error);
      throw error;
    }
  }

  /**
   * Get all custom voices for user
   */
  async getCustomVoices(): Promise<CustomVoice[]> {
    try {
      const response = await fetch(`${this.apiUrl}/voices`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch custom voices: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get custom voices error:', error);
      throw error;
    }
  }

  /**
   * Delete custom voice
   */
  async deleteCustomVoice(voiceId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/voices/${voiceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete voice: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Delete voice error:', error);
      throw error;
    }
  }

  /**
   * Test custom voice with sample text
   */
  async testVoice(voiceId: string, text: string, language: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/test-voice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ voiceId, text, language }),
      });

      if (!response.ok) {
        throw new Error(`Voice test failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.audioUrl;
    } catch (error) {
      console.error('Voice test error:', error);
      throw error;
    }
  }
}

// Export singleton
let voiceService: VoiceService | null = null;

export const initVoiceService = (apiKey: string) => {
  voiceService = new VoiceService(apiKey);
  return voiceService;
};

export const getVoiceService = (): VoiceService => {
  if (!voiceService) {
    throw new Error('VoiceService not initialized.');
  }
  return voiceService;
};
