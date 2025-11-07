/**
 * MIDI Generation and Export Service
 * Handles audio-to-MIDI, text-to-MIDI, and MIDI export
 */

import { Midi } from '@tonejs/midi';
import type { MIDIData, MIDITrack, MIDINote } from '../../types/music';

export interface MidiGenerationOptions {
  prompt?: string;
  key?: string;
  scale?: 'major' | 'minor';
  chordProgression?: string[];
  complexity?: 'simple' | 'medium' | 'complex';
}

export class MidiService {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiUrl = process.env.VITE_MIDI_API_URL || 'https://api.midiflow.ai';
    this.apiKey = apiKey;
  }

  /**
   * Convert audio to MIDI
   */
  async audioToMidi(audioFile: File, options?: {
    instrument?: string;
    quantize?: boolean;
    includeVelocity?: boolean;
  }): Promise<MIDIData> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    try {
      const response = await fetch(`${this.apiUrl}/audio-to-midi`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Audio to MIDI conversion failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseMidiData(data);
    } catch (error) {
      console.error('Audio to MIDI error:', error);
      throw error;
    }
  }

  /**
   * Generate MIDI from text description
   */
  async textToMidi(options: MidiGenerationOptions): Promise<MIDIData> {
    try {
      const response = await fetch(`${this.apiUrl}/text-to-midi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error(`Text to MIDI generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseMidiData(data);
    } catch (error) {
      console.error('Text to MIDI error:', error);
      throw error;
    }
  }

  /**
   * Generate chord progression MIDI
   */
  async generateChordProgression(
    chords: string[],
    key: string,
    bpm: number
  ): Promise<MIDIData> {
    try {
      const response = await fetch(`${this.apiUrl}/chord-progression`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ chords, key, bpm }),
      });

      if (!response.ok) {
        throw new Error(`Chord progression generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseMidiData(data);
    } catch (error) {
      console.error('Chord progression error:', error);
      throw error;
    }
  }

  /**
   * Export MIDI data to file
   */
  exportToMidiFile(midiData: MIDIData, filename: string): Blob {
    const midi = new Midi();
    midi.header.setTempo(midiData.bpm);

    const [numerator, denominator] = midiData.timeSignature.split('/').map(Number);
    midi.header.timeSignatures.push({
      ticks: 0,
      timeSignature: [numerator, denominator],
      measures: 0,
    });

    midiData.tracks.forEach((trackData) => {
      const track = midi.addTrack();
      track.name = trackData.name;
      track.instrument.name = trackData.instrument;

      trackData.notes.forEach((note) => {
        track.addNote({
          midi: note.pitch,
          time: note.startTime,
          duration: note.duration,
          velocity: note.velocity / 127,
        });
      });
    });

    return new Blob([midi.toArray()], { type: 'audio/midi' });
  }

  /**
   * Import MIDI file
   */
  async importMidiFile(file: File): Promise<MIDIData> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const midi = new Midi(arrayBuffer);

      const tracks: MIDITrack[] = midi.tracks.map((track) => ({
        name: track.name,
        instrument: track.instrument.name,
        notes: track.notes.map((note) => ({
          pitch: note.midi,
          velocity: Math.round(note.velocity * 127),
          startTime: note.time,
          duration: note.duration,
        })),
      }));

      return {
        tracks,
        bpm: midi.header.tempos[0]?.bpm || 120,
        timeSignature: midi.header.timeSignatures[0]
          ? `${midi.header.timeSignatures[0].timeSignature[0]}/${midi.header.timeSignatures[0].timeSignature[1]}`
          : '4/4',
      };
    } catch (error) {
      console.error('MIDI import error:', error);
      throw error;
    }
  }

  /**
   * Quantize MIDI notes
   */
  quantizeNotes(notes: MIDINote[], gridSize: number): MIDINote[] {
    return notes.map((note) => ({
      ...note,
      startTime: Math.round(note.startTime / gridSize) * gridSize,
      duration: Math.round(note.duration / gridSize) * gridSize,
    }));
  }

  /**
   * Transpose MIDI data
   */
  transposeNotes(notes: MIDINote[], semitones: number): MIDINote[] {
    return notes.map((note) => ({
      ...note,
      pitch: Math.max(0, Math.min(127, note.pitch + semitones)),
    }));
  }

  /**
   * Parse MIDI data from API response
   */
  private parseMidiData(data: any): MIDIData {
    return {
      tracks: data.tracks || [],
      bpm: data.bpm || 120,
      timeSignature: data.timeSignature || '4/4',
    };
  }

  /**
   * Download MIDI file
   */
  downloadMidiFile(midiData: MIDIData, filename: string): void {
    const blob = this.exportToMidiFile(midiData, filename);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.mid') ? filename : `${filename}.mid`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Export singleton
let midiService: MidiService | null = null;

export const initMidiService = (apiKey: string) => {
  midiService = new MidiService(apiKey);
  return midiService;
};

export const getMidiService = (): MidiService => {
  if (!midiService) {
    throw new Error('MidiService not initialized.');
  }
  return midiService;
};
