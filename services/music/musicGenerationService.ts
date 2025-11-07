/**
 * AI Music Generation Service
 * Integrates with multiple AI models: Suno V4/V4.5/V5, Udio, Stable Audio
 */

import type {
  GenerationRequest,
  GeneratedTrack,
  AIModel,
  MusicGenre,
  Mood,
  VoiceType
} from '../../types/music';

// API Configuration
const API_ENDPOINTS = {
  'suno-v4': process.env.VITE_SUNO_API_URL || 'https://api.suno.ai/v4',
  'suno-v4.5': process.env.VITE_SUNO_API_URL || 'https://api.suno.ai/v4.5',
  'suno-v5': process.env.VITE_SUNO_API_URL || 'https://api.suno.ai/v5',
  'udio-allegro-v1.5': process.env.VITE_UDIO_API_URL || 'https://api.udio.com/v1.5',
  'stable-audio': process.env.VITE_STABLE_AUDIO_API_URL || 'https://api.stability.ai/audio',
};

export class MusicGenerationService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate music from text description
   */
  async generateFromText(request: GenerationRequest): Promise<GeneratedTrack> {
    const endpoint = API_ENDPOINTS[request.model];

    const payload = {
      prompt: request.prompt,
      genre: request.genre,
      mood: request.mood,
      tempo: request.tempo || 120,
      duration: request.duration || 180,
      key: request.key || 'C',
      voiceType: request.voiceType,
    };

    try {
      const response = await fetch(`${endpoint}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformToGeneratedTrack(data, request);
    } catch (error) {
      console.error('Music generation error:', error);
      throw error;
    }
  }

  /**
   * Generate song from lyrics
   */
  async generateFromLyrics(
    lyrics: string,
    genre: MusicGenre,
    mood: Mood,
    voiceType: VoiceType,
    model: AIModel
  ): Promise<GeneratedTrack> {
    const request: GenerationRequest = {
      id: this.generateId(),
      type: 'lyrics-to-song',
      model,
      lyrics,
      genre,
      mood,
      voiceType,
      createdAt: new Date(),
      status: 'processing',
    };

    return this.generateFromText(request);
  }

  /**
   * Extend existing audio
   */
  async extendAudio(
    audioFile: File,
    targetDuration: number,
    style: string,
    model: AIModel
  ): Promise<GeneratedTrack> {
    const endpoint = API_ENDPOINTS[model];
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('targetDuration', targetDuration.toString());
    formData.append('style', style);

    try {
      const response = await fetch(`${endpoint}/extend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Audio extension failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformToGeneratedTrack(data);
    } catch (error) {
      console.error('Audio extension error:', error);
      throw error;
    }
  }

  /**
   * Generate full song from audio sample
   */
  async sampleToSong(
    sample: File,
    prompt: string,
    genre: MusicGenre,
    model: AIModel
  ): Promise<GeneratedTrack> {
    const endpoint = API_ENDPOINTS[model];
    const formData = new FormData();
    formData.append('sample', sample);
    formData.append('prompt', prompt);
    formData.append('genre', genre);

    try {
      const response = await fetch(`${endpoint}/sample-to-song`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Sample to song failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformToGeneratedTrack(data);
    } catch (error) {
      console.error('Sample to song error:', error);
      throw error;
    }
  }

  /**
   * Generate specific instrument/stem
   */
  async generateStem(
    type: string,
    referenceTrack: string,
    chordProgression?: string[]
  ): Promise<{ audioUrl: string; type: string }> {
    // This would call the API to generate a specific stem
    // that fits with the existing track
    const endpoint = API_ENDPOINTS['suno-v5']; // Default to Suno V5 for stems

    try {
      const response = await fetch(`${endpoint}/generate-stem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          stemType: type,
          referenceTrack,
          chordProgression,
        }),
      });

      if (!response.ok) {
        throw new Error(`Stem generation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Stem generation error:', error);
      throw error;
    }
  }

  /**
   * Get generation status
   */
  async getGenerationStatus(generationId: string, model: AIModel): Promise<string> {
    const endpoint = API_ENDPOINTS[model];

    try {
      const response = await fetch(`${endpoint}/status/${generationId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error('Status check error:', error);
      throw error;
    }
  }

  /**
   * Transform API response to GeneratedTrack
   */
  private transformToGeneratedTrack(data: any, request?: GenerationRequest): GeneratedTrack {
    return {
      id: data.id || this.generateId(),
      requestId: request?.id || '',
      title: data.title || 'Untitled Track',
      audioUrl: data.audioUrl || data.url,
      duration: data.duration || 0,
      bpm: data.bpm || request?.tempo || 120,
      key: data.key || request?.key || 'C',
      genre: data.genre || request?.genre || 'pop',
      waveformData: data.waveformData,
      metadata: {
        artist: data.artist,
        album: data.album,
        year: data.year,
        tags: data.tags || [],
        description: data.description,
      },
      createdAt: new Date(),
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
let musicService: MusicGenerationService | null = null;

export const initMusicService = (apiKey: string) => {
  musicService = new MusicGenerationService(apiKey);
  return musicService;
};

export const getMusicService = (): MusicGenerationService => {
  if (!musicService) {
    throw new Error('MusicGenerationService not initialized. Call initMusicService first.');
  }
  return musicService;
};
