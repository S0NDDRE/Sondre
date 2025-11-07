/**
 * Real Music Synthesis Engine
 * Uses Tone.js to generate actual music in the browser
 * No external APIs required - works immediately!
 */

import * as Tone from 'tone';
import type { MusicGenre, Mood } from '../../types/music';

// Musical scales and chord progressions
const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
  blues: [0, 3, 5, 6, 7, 10],
};

const CHORD_PROGRESSIONS: Record<string, number[][]> = {
  pop: [[0, 4, 7], [5, 9, 0], [7, 11, 2], [0, 4, 7]], // I-IV-V-I
  emotional: [[0, 4, 7], [5, 9, 0], [3, 7, 10], [0, 4, 7]], // I-IV-iii-I
  epic: [[0, 4, 7], [7, 11, 2], [9, 0, 4], [0, 4, 7]], // I-V-vi-I
  dark: [[0, 3, 7], [5, 8, 0], [7, 10, 2], [0, 3, 7]], // i-iv-v-i (minor)
};

export class SynthesisEngine {
  private synths: {
    lead: Tone.PolySynth;
    bass: Tone.MonoSynth;
    pad: Tone.PolySynth;
    drums: any;
  };

  private effects: {
    reverb: Tone.Reverb;
    delay: Tone.FeedbackDelay;
    compressor: Tone.Compressor;
  };

  constructor() {
    // Initialize synthesizers
    this.synths = {
      lead: new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 },
      }),
      bass: new Tone.MonoSynth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.5 },
        filterEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.2 },
      }),
      pad: new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.5, decay: 0.2, sustain: 0.8, release: 2 },
      }),
      drums: null, // Will be initialized when needed
    };

    // Initialize effects
    this.effects = {
      reverb: new Tone.Reverb({ decay: 2, wet: 0.3 }),
      delay: new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.3, wet: 0.2 }),
      compressor: new Tone.Compressor({ threshold: -20, ratio: 3 }),
    };

    // Connect effects chain
    this.synths.lead.chain(this.effects.delay, this.effects.reverb, this.effects.compressor, Tone.Destination);
    this.synths.bass.connect(this.effects.compressor).toDestination();
    this.synths.pad.chain(this.effects.reverb, this.effects.compressor, Tone.Destination);
  }

  /**
   * Generate music based on parameters
   */
  async generateMusic(params: {
    genre: MusicGenre;
    mood: Mood;
    tempo: number;
    duration: number;
    key: string;
  }): Promise<Blob> {
    await Tone.start();
    Tone.Transport.bpm.value = params.tempo;

    const recorder = new Tone.Recorder();

    // Connect all synths to recorder
    this.effects.compressor.connect(recorder);

    // Start recording
    recorder.start();

    // Generate musical content
    await this.composeTrack(params);

    // Wait for duration
    await new Promise(resolve => setTimeout(resolve, params.duration * 1000));

    // Stop recording
    const recording = await recorder.stop();

    return recording;
  }

  /**
   * Compose a complete track
   */
  private async composeTrack(params: {
    genre: MusicGenre;
    mood: Mood;
    tempo: number;
    duration: number;
  }): Promise<void> {
    const scale = this.getScaleForMood(params.mood);
    const progression = this.getProgressionForGenre(params.genre);

    // Schedule melody
    this.scheduleMelody(scale, params.duration);

    // Schedule chords
    this.scheduleChords(progression, params.duration);

    // Schedule bass
    this.scheduleBass(progression, params.duration);

    // Schedule drums
    this.scheduleDrums(params.genre, params.duration);

    // Start transport
    Tone.Transport.start();
  }

  /**
   * Generate melodic line
   */
  private scheduleMelody(scale: number[], duration: number): void {
    const notes = this.generateMelody(scale, Math.floor(duration / 4));

    let time = 0;
    notes.forEach((note, i) => {
      this.synths.lead.triggerAttackRelease(
        Tone.Frequency(note, 'midi').toNote(),
        '8n',
        time
      );
      time += Tone.Time('8n').toSeconds();
    });
  }

  /**
   * Generate chord progression
   */
  private scheduleChords(progression: number[][], duration: number): void {
    const chordDuration = '2n';
    let time = 0;

    for (let i = 0; i < Math.floor(duration / 2); i++) {
      const chordIndex = i % progression.length;
      const chord = progression[chordIndex].map(note =>
        Tone.Frequency(note + 48, 'midi').toNote()
      );

      this.synths.pad.triggerAttackRelease(chord, chordDuration, time);
      time += Tone.Time(chordDuration).toSeconds();
    }
  }

  /**
   * Generate bass line
   */
  private scheduleBass(progression: number[][], duration: number): void {
    let time = 0;

    for (let i = 0; i < Math.floor(duration); i++) {
      const chordIndex = Math.floor(i / 2) % progression.length;
      const rootNote = progression[chordIndex][0] + 36; // Low octave

      this.synths.bass.triggerAttackRelease(
        Tone.Frequency(rootNote, 'midi').toNote(),
        '4n',
        time
      );
      time += Tone.Time('4n').toSeconds();
    }
  }

  /**
   * Generate drum pattern
   */
  private scheduleDrums(genre: MusicGenre, duration: number): void {
    const kick = new Tone.MembraneSynth().toDestination();
    const snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
    }).toDestination();
    const hihat = new Tone.MetalSynth({
      frequency: 200,
      envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
    }).toDestination();

    const pattern = this.getDrumPattern(genre);
    let time = 0;

    for (let i = 0; i < duration * 4; i++) {
      const step = i % pattern.length;

      if (pattern[step].kick) {
        kick.triggerAttackRelease('C1', '8n', time);
      }
      if (pattern[step].snare) {
        snare.triggerAttackRelease('8n', time);
      }
      if (pattern[step].hihat) {
        hihat.triggerAttackRelease('16n', time);
      }

      time += Tone.Time('16n').toSeconds();
    }
  }

  /**
   * Generate melody from scale
   */
  private generateMelody(scale: number[], length: number): number[] {
    const melody: number[] = [];
    const baseOctave = 60; // Middle C

    for (let i = 0; i < length; i++) {
      // Simple melodic algorithm - can be enhanced
      const scaleIndex = Math.floor(Math.random() * scale.length);
      const note = baseOctave + scale[scaleIndex];
      melody.push(note);
    }

    return melody;
  }

  /**
   * Get scale based on mood
   */
  private getScaleForMood(mood: Mood): number[] {
    const moodToScale: Record<string, keyof typeof SCALES> = {
      happy: 'major',
      energetic: 'major',
      uplifting: 'major',
      sad: 'minor',
      melancholic: 'minor',
      dark: 'minor',
      calm: 'pentatonic',
      romantic: 'major',
    };

    return SCALES[moodToScale[mood] || 'major'];
  }

  /**
   * Get chord progression for genre
   */
  private getProgressionForGenre(genre: MusicGenre): number[][] {
    const genreToProgression: Record<string, keyof typeof CHORD_PROGRESSIONS> = {
      pop: 'pop',
      rock: 'pop',
      electronic: 'epic',
      'hip-hop': 'dark',
      jazz: 'emotional',
      classical: 'emotional',
    };

    return CHORD_PROGRESSIONS[genreToProgression[genre] || 'pop'];
  }

  /**
   * Get drum pattern for genre
   */
  private getDrumPattern(genre: MusicGenre): Array<{ kick: boolean; snare: boolean; hihat: boolean }> {
    const patterns: Record<string, Array<{ kick: boolean; snare: boolean; hihat: boolean }>> = {
      pop: [
        { kick: true, snare: false, hihat: true },
        { kick: false, snare: false, hihat: true },
        { kick: false, snare: true, hihat: true },
        { kick: false, snare: false, hihat: true },
      ],
      rock: [
        { kick: true, snare: false, hihat: true },
        { kick: false, snare: false, hihat: false },
        { kick: false, snare: true, hihat: true },
        { kick: false, snare: false, hihat: false },
      ],
      electronic: [
        { kick: true, snare: false, hihat: true },
        { kick: false, snare: false, hihat: true },
        { kick: true, snare: false, hihat: true },
        { kick: false, snare: true, hihat: true },
      ],
    };

    return patterns[genre] || patterns.pop;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    Object.values(this.synths).forEach(synth => {
      if (synth) synth.dispose();
    });
    Object.values(this.effects).forEach(effect => {
      if (effect) effect.dispose();
    });
  }
}

// Export singleton
let synthesisEngine: SynthesisEngine | null = null;

export const getSynthesisEngine = (): SynthesisEngine => {
  if (!synthesisEngine) {
    synthesisEngine = new SynthesisEngine();
  }
  return synthesisEngine;
};
