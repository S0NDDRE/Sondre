// Core Music Types for AI Music Generation Studio

export type AIModel = 'suno-v4' | 'suno-v4.5' | 'suno-v5' | 'udio-allegro-v1.5' | 'stable-audio';

export type MusicGenre =
  | 'pop' | 'rock' | 'hip-hop' | 'electronic' | 'jazz'
  | 'classical' | 'country' | 'r&b' | 'metal' | 'indie'
  | 'folk' | 'blues' | 'reggae' | 'latin' | 'edm';

export type Mood =
  | 'happy' | 'sad' | 'energetic' | 'calm' | 'angry'
  | 'romantic' | 'melancholic' | 'uplifting' | 'dark' | 'mysterious';

export type VoiceType =
  | 'male-tenor' | 'male-baritone' | 'male-bass'
  | 'female-soprano' | 'female-alto' | 'female-mezzo'
  | 'child' | 'choir' | 'custom';

export type StemType =
  | 'vocals' | 'drums' | 'bass' | 'guitar' | 'piano'
  | 'synth' | 'strings' | 'brass' | 'percussion' | 'fx'
  | 'backing-vocals' | 'lead';

export type ExportFormat = 'mp3' | 'wav' | 'flac' | 'midi' | 'mp4';

export interface GenerationRequest {
  id: string;
  type: 'text-to-music' | 'lyrics-to-song' | 'audio-extension' | 'sample-to-song';
  model: AIModel;
  prompt?: string;
  lyrics?: string;
  genre?: MusicGenre;
  mood?: Mood;
  voiceType?: VoiceType;
  tempo?: number; // BPM
  duration?: number; // seconds
  key?: string; // e.g., 'C', 'Am', 'F#m'
  audioFile?: File;
  createdAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface GeneratedTrack {
  id: string;
  requestId: string;
  title: string;
  audioUrl: string;
  duration: number;
  bpm: number;
  key: string;
  genre: MusicGenre;
  stems?: Stem[];
  waveformData?: number[];
  metadata: TrackMetadata;
  createdAt: Date;
}

export interface Stem {
  id: string;
  type: StemType;
  audioUrl: string;
  volume: number; // 0-100
  pan: number; // -100 to 100
  solo: boolean;
  mute: boolean;
  effects: Effect[];
}

export interface Effect {
  id: string;
  type: 'reverb' | 'delay' | 'distortion' | 'chorus' | 'eq' | 'compressor' | 'filter';
  enabled: boolean;
  parameters: Record<string, number>;
}

export interface TrackMetadata {
  artist?: string;
  album?: string;
  year?: number;
  tags: string[];
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  tracks: ProjectTrack[];
  bpm: number;
  timeSignature: string; // e.g., '4/4', '3/4'
  key: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectTrack {
  id: string;
  name: string;
  generatedTrack?: GeneratedTrack;
  position: number; // milliseconds
  volume: number;
  pan: number;
  solo: boolean;
  mute: boolean;
  effects: Effect[];
  color: string;
}

export interface VoiceCloneRequest {
  id: string;
  name: string;
  audioSample: File;
  sampleDuration: number; // 3-60 seconds
  language: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface CustomVoice {
  id: string;
  name: string;
  voiceId: string;
  language: string;
  sampleUrl: string;
  createdAt: Date;
}

export interface MIDIData {
  tracks: MIDITrack[];
  bpm: number;
  timeSignature: string;
}

export interface MIDITrack {
  name: string;
  notes: MIDINote[];
  instrument: string;
}

export interface MIDINote {
  pitch: number; // MIDI note number 0-127
  velocity: number; // 0-127
  startTime: number; // seconds
  duration: number; // seconds
}

export interface AudioAnalysis {
  bpm: number;
  key: string;
  energy: number; // 0-100
  danceability: number; // 0-100
  valence: number; // 0-100 (happiness)
  loudness: number; // dB
  spectralData: number[][];
}

export interface SmartBotSuggestion {
  id: string;
  type: 'arrangement' | 'mixing' | 'effect' | 'generation' | 'improvement';
  title: string;
  description: string;
  action: () => void;
}

export interface UserPreferences {
  favoriteGenres: MusicGenre[];
  favoriteMoods: Mood[];
  preferredModel: AIModel;
  recentProjects: string[];
  customVoices: CustomVoice[];
}
