/**
 * Real Music Generation Service
 * Hybrid approach: Real AI APIs (Suno) + Fallback to Tone.js synthesis
 */

import { getSynthesisEngine } from './synthesisEngine';
import { getSunoService } from './sunoAPIService';
import type {
  GenerationRequest,
  GeneratedTrack,
  MusicGenre,
  Mood,
  VoiceType,
  AIModel
} from '../../types/music';

export class MusicGenerationService {
  private synthesisEngine = getSynthesisEngine();
  private useRealAPI: boolean;

  constructor(useRealAPI: boolean = true) {
    this.useRealAPI = useRealAPI;
  }

  /**
   * Generate music from text description
   * Tries Suno API first, falls back to Tone.js synthesis
   */
  async generateFromText(request: GenerationRequest): Promise<GeneratedTrack> {
    // Try Suno API if available and enabled
    if (this.useRealAPI) {
      const sunoService = getSunoService();

      if (sunoService) {
        try {
          console.log('🎵 Generating with Suno AI API...', request);

          const track = await sunoService.generateMusic({
            prompt: request.prompt || '',
            genre: request.genre,
            mood: request.mood,
            instrumental: !request.voiceType || request.voiceType === 'custom',
            title: this.generateTitle(request),
          });

          console.log('✅ Suno AI generation successful!', track);
          return track;
        } catch (error) {
          console.warn('⚠️ Suno API failed, falling back to browser synthesis:', error);
          // Fall through to Tone.js synthesis
        }
      }
    }

    // Fallback: Browser-based synthesis with Tone.js
    try {
      console.log('🎹 Generating with Tone.js synthesis...', request);

      // Generate actual audio using Tone.js
      const audioBlob = await this.synthesisEngine.generateMusic({
        genre: request.genre || 'pop',
        mood: request.mood || 'happy',
        tempo: request.tempo || 120,
        duration: Math.min(request.duration || 30, 30), // Limit to 30s for synthesis
        key: request.key || 'C',
      });

      // Create object URL for the generated audio
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create track metadata
      const track: GeneratedTrack = {
        id: this.generateId(),
        requestId: request.id,
        title: this.generateTitle(request),
        audioUrl,
        duration: request.duration || 30,
        bpm: request.tempo || 120,
        key: request.key || 'C',
        genre: request.genre || 'pop',
        metadata: {
          tags: [request.genre || 'pop', request.mood || 'happy', 'Tone.js'],
          description: request.prompt || 'Browser-synthesized music',
        },
        createdAt: new Date(),
      };

      console.log('✅ Tone.js generation successful!', track);
      return track;

    } catch (error) {
      console.error('❌ All generation methods failed:', error);
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
    // For now, generate instrumental backing track
    // Voice synthesis would require additional APIs (ElevenLabs, etc.)
    const request: GenerationRequest = {
      id: this.generateId(),
      type: 'lyrics-to-song',
      model,
      lyrics,
      genre,
      mood,
      voiceType,
      tempo: 120,
      duration: 30,
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
    // Generate continuation using similar parameters
    console.log('Extending audio...', audioFile.name);

    const request: GenerationRequest = {
      id: this.generateId(),
      type: 'audio-extension',
      model,
      audioFile,
      duration: targetDuration,
      createdAt: new Date(),
      status: 'processing',
    };

    return this.generateFromText(request);
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
    console.log('Generating from sample...', sample.name);

    const request: GenerationRequest = {
      id: this.generateId(),
      type: 'sample-to-song',
      model,
      prompt,
      genre,
      audioFile: sample,
      duration: 30,
      createdAt: new Date(),
      status: 'processing',
    };

    return this.generateFromText(request);
  }

  /**
   * Generate specific instrument/stem
   */
  async generateStem(
    type: string,
    referenceTrack: string,
    chordProgression?: string[]
  ): Promise<{ audioUrl: string; type: string }> {
    // Generate a simple stem using synthesis
    const audioBlob = await this.synthesisEngine.generateMusic({
      genre: 'pop',
      mood: 'happy',
      tempo: 120,
      duration: 8,
      key: 'C',
    });

    return {
      audioUrl: URL.createObjectURL(audioBlob),
      type,
    };
  }

  /**
   * Generate title from request
   */
  private generateTitle(request: GenerationRequest): string {
    const genre = request.genre || 'pop';
    const mood = request.mood || 'happy';

    if (request.prompt) {
      // Extract potential title from prompt
      const words = request.prompt.split(' ').slice(0, 3);
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    // Generate descriptive title
    const adjectives = {
      happy: 'Upbeat',
      sad: 'Melancholic',
      energetic: 'Dynamic',
      calm: 'Peaceful',
      dark: 'Mysterious',
      romantic: 'Sweet',
    };

    const adjective = adjectives[mood as keyof typeof adjectives] || 'Beautiful';
    return `${adjective} ${genre.charAt(0).toUpperCase() + genre.slice(1)} Track`;
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

export const initMusicService = () => {
  musicService = new MusicGenerationService();
  return musicService;
};

export const getMusicService = (): MusicGenerationService => {
  if (!musicService) {
    musicService = new MusicGenerationService();
  }
  return musicService;
};
