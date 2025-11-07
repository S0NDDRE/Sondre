/**
 * Suno AI Music Generation API Integration
 * Real API integration with sunoapi.org
 */

import type { MusicGenre, Mood, GeneratedTrack } from '../../types/music';

interface SunoGenerationRequest {
  prompt: string;
  make_instrumental?: boolean;
  wait_audio?: boolean;
  model?: 'chirp-v3-5' | 'chirp-v3-0' | 'chirp-v2-0';
  title?: string;
  tags?: string;
  continue_clip_id?: string;
  continue_at?: number;
}

interface SunoGenerationResponse {
  id: string;
  title: string;
  audio_url: string;
  video_url: string;
  image_url: string;
  lyric: string;
  model_name: string;
  status: 'queued' | 'processing' | 'complete' | 'error';
  created_at: string;
  duration?: number;
  tags?: string;
}

export class SunoAPIService {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiKey: string, apiUrl: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  /**
   * Generate music with Suno AI
   */
  async generateMusic(params: {
    prompt: string;
    genre?: MusicGenre;
    mood?: Mood;
    instrumental?: boolean;
    title?: string;
  }): Promise<GeneratedTrack> {
    try {
      // Build enhanced prompt with genre and mood
      const enhancedPrompt = this.buildPrompt(params.prompt, params.genre, params.mood);

      const request: SunoGenerationRequest = {
        prompt: enhancedPrompt,
        make_instrumental: params.instrumental || false,
        wait_audio: true,
        model: 'chirp-v3-5', // Latest model
        title: params.title,
        tags: params.genre ? this.genreToTags(params.genre) : undefined,
      };

      console.log('🎵 Generating with Suno AI...', request);

      const response = await fetch(`${this.apiUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Suno API error: ${response.status} - ${error}`);
      }

      const data: SunoGenerationResponse[] = await response.json();

      if (!data || data.length === 0) {
        throw new Error('No generation returned from Suno API');
      }

      const sunoTrack = data[0];

      // Wait for completion if needed
      if (sunoTrack.status !== 'complete') {
        return await this.waitForCompletion(sunoTrack.id);
      }

      return this.transformToGeneratedTrack(sunoTrack, params);
    } catch (error) {
      console.error('Suno API generation error:', error);
      throw error;
    }
  }

  /**
   * Generate from lyrics
   */
  async generateFromLyrics(params: {
    lyrics: string;
    genre?: MusicGenre;
    mood?: Mood;
    title?: string;
  }): Promise<GeneratedTrack> {
    const prompt = `${params.genre || ''} ${params.mood || ''} song\n\nLyrics:\n${params.lyrics}`;

    return this.generateMusic({
      prompt,
      genre: params.genre,
      mood: params.mood,
      instrumental: false,
      title: params.title,
    });
  }

  /**
   * Extend/continue existing audio
   */
  async extendAudio(audioId: string, continueAt: number = 0): Promise<GeneratedTrack> {
    try {
      const request: SunoGenerationRequest = {
        prompt: '', // Not needed for continuation
        continue_clip_id: audioId,
        continue_at: continueAt,
        wait_audio: true,
      };

      const response = await fetch(`${this.apiUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to extend audio: ${response.statusText}`);
      }

      const data: SunoGenerationResponse[] = await response.json();
      return this.transformToGeneratedTrack(data[0]);
    } catch (error) {
      console.error('Audio extension error:', error);
      throw error;
    }
  }

  /**
   * Get generation status
   */
  async getStatus(generationId: string): Promise<SunoGenerationResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/api/get?ids=${generationId}`, {
        headers: {
          'api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get status: ${response.statusText}`);
      }

      const data: SunoGenerationResponse[] = await response.json();
      return data[0];
    } catch (error) {
      console.error('Status check error:', error);
      throw error;
    }
  }

  /**
   * Wait for generation to complete
   */
  private async waitForCompletion(generationId: string): Promise<GeneratedTrack> {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      const status = await this.getStatus(generationId);

      if (status.status === 'complete') {
        return this.transformToGeneratedTrack(status);
      }

      if (status.status === 'error') {
        throw new Error('Suno generation failed');
      }

      attempts++;
      console.log(`⏳ Waiting for Suno... (${attempts}/${maxAttempts})`);
    }

    throw new Error('Suno generation timeout');
  }

  /**
   * Build enhanced prompt
   */
  private buildPrompt(basePrompt: string, genre?: MusicGenre, mood?: Mood): string {
    let prompt = basePrompt;

    if (genre) {
      prompt = `${this.genreToDescription(genre)} ${prompt}`;
    }

    if (mood) {
      prompt = `${this.moodToDescription(mood)} ${prompt}`;
    }

    return prompt;
  }

  /**
   * Convert genre to tags
   */
  private genreToTags(genre: MusicGenre): string {
    const genreMap: Record<MusicGenre, string> = {
      'pop': 'pop, catchy, upbeat',
      'rock': 'rock, guitar, energetic',
      'hip-hop': 'hip hop, rap, beats',
      'electronic': 'electronic, edm, synth',
      'jazz': 'jazz, smooth, sophisticated',
      'classical': 'classical, orchestral, elegant',
      'country': 'country, acoustic, storytelling',
      'r&b': 'r&b, soul, smooth',
      'metal': 'metal, heavy, intense',
      'indie': 'indie, alternative, creative',
      'folk': 'folk, acoustic, authentic',
      'blues': 'blues, soulful, emotional',
      'reggae': 'reggae, laid-back, groovy',
      'latin': 'latin, rhythmic, passionate',
      'edm': 'edm, dance, energetic',
    };

    return genreMap[genre] || genre;
  }

  /**
   * Convert genre to description
   */
  private genreToDescription(genre: MusicGenre): string {
    return genre.charAt(0).toUpperCase() + genre.slice(1);
  }

  /**
   * Convert mood to description
   */
  private moodToDescription(mood: Mood): string {
    return mood.charAt(0).toUpperCase() + mood.slice(1);
  }

  /**
   * Transform Suno response to GeneratedTrack
   */
  private transformToGeneratedTrack(
    sunoTrack: SunoGenerationResponse,
    params?: any
  ): GeneratedTrack {
    return {
      id: sunoTrack.id,
      requestId: sunoTrack.id,
      title: sunoTrack.title || 'Untitled Track',
      audioUrl: sunoTrack.audio_url,
      duration: sunoTrack.duration || 0,
      bpm: 120, // Suno doesn't provide BPM
      key: 'C', // Suno doesn't provide key
      genre: params?.genre || 'pop',
      metadata: {
        tags: sunoTrack.tags?.split(',') || [],
        description: sunoTrack.lyric,
      },
      createdAt: new Date(sunoTrack.created_at),
    };
  }
}

// Export singleton
let sunoService: SunoAPIService | null = null;

export const initSunoService = (apiKey: string, apiUrl: string) => {
  sunoService = new SunoAPIService(apiKey, apiUrl);
  return sunoService;
};

export const getSunoService = (): SunoAPIService | null => {
  return sunoService;
};
