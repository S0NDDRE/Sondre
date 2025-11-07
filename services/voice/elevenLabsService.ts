/**
 * ElevenLabs Voice AI Integration
 * Professional voice synthesis and cloning
 */

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
}

export class ElevenLabsService {
  private apiKey: string;
  private apiUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get available voices
   */
  async getVoices(): Promise<ElevenLabsVoice[]> {
    try {
      const response = await fetch(`${this.apiUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.statusText}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('ElevenLabs get voices error:', error);
      throw error;
    }
  }

  /**
   * Generate speech from text
   */
  async textToSpeech(params: {
    text: string;
    voiceId?: string;
    stability?: number;
    similarityBoost?: number;
    style?: number;
    useSpeakerBoost?: boolean;
  }): Promise<Blob> {
    try {
      const voiceId = params.voiceId || '21m00Tcm4TlvDq8ikWAM'; // Default: Rachel

      const response = await fetch(`${this.apiUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: params.text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: params.stability || 0.5,
            similarity_boost: params.similarityBoost || 0.75,
            style: params.style || 0,
            use_speaker_boost: params.useSpeakerBoost !== false,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Text-to-speech failed: ${response.status} - ${error}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      throw error;
    }
  }

  /**
   * Clone voice from audio samples
   */
  async cloneVoice(params: {
    name: string;
    description?: string;
    files: File[];
    labels?: Record<string, string>;
  }): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('name', params.name);

      if (params.description) {
        formData.append('description', params.description);
      }

      // Add audio files
      params.files.forEach((file, index) => {
        formData.append('files', file, `sample_${index}.mp3`);
      });

      // Add labels if provided
      if (params.labels) {
        formData.append('labels', JSON.stringify(params.labels));
      }

      const response = await fetch(`${this.apiUrl}/voices/add`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Voice cloning failed: ${response.status} - ${error}`);
      }

      const data = await response.json();
      return data.voice_id;
    } catch (error) {
      console.error('ElevenLabs clone voice error:', error);
      throw error;
    }
  }

  /**
   * Delete cloned voice
   */
  async deleteVoice(voiceId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/voices/${voiceId}`, {
        method: 'DELETE',
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete voice: ${response.statusText}`);
      }
    } catch (error) {
      console.error('ElevenLabs delete voice error:', error);
      throw error;
    }
  }

  /**
   * Get voice settings
   */
  async getVoiceSettings(voiceId: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/voices/${voiceId}/settings`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get voice settings: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('ElevenLabs get settings error:', error);
      throw error;
    }
  }

  /**
   * Generate speech with streaming
   */
  async textToSpeechStream(params: {
    text: string;
    voiceId?: string;
    onChunk?: (chunk: Uint8Array) => void;
  }): Promise<void> {
    try {
      const voiceId = params.voiceId || '21m00Tcm4TlvDq8ikWAM';

      const response = await fetch(`${this.apiUrl}/text-to-speech/${voiceId}/stream`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: params.text,
          model_id: 'eleven_monolingual_v1',
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming failed');
      }

      const reader = response.body.getReader();

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        if (params.onChunk && value) {
          params.onChunk(value);
        }
      }
    } catch (error) {
      console.error('ElevenLabs streaming error:', error);
      throw error;
    }
  }
}

// Export singleton
let elevenLabsService: ElevenLabsService | null = null;

export const initElevenLabsService = (apiKey: string) => {
  elevenLabsService = new ElevenLabsService(apiKey);
  return elevenLabsService;
};

export const getElevenLabsService = (): ElevenLabsService | null => {
  return elevenLabsService;
};
