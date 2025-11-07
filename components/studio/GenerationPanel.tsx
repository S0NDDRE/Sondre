/**
 * Music Generation Panel
 * Main interface for AI music generation
 */

import React, { useState } from 'react';
import { Music, Mic, FileAudio, Sparkles } from 'lucide-react';
import { useMusicStore } from '../../store/musicStore';
import type { AIModel, MusicGenre, Mood, VoiceType } from '../../types/music';
import { getMusicService } from '../../services/music/musicGenerationService';

const GENRES: MusicGenre[] = [
  'pop', 'rock', 'hip-hop', 'electronic', 'jazz',
  'classical', 'country', 'r&b', 'metal', 'indie'
];

const MOODS: Mood[] = [
  'happy', 'sad', 'energetic', 'calm', 'angry',
  'romantic', 'melancholic', 'uplifting', 'dark'
];

const AI_MODELS: AIModel[] = [
  'suno-v5', 'suno-v4.5', 'suno-v4', 'udio-allegro-v1.5', 'stable-audio'
];

const VOICE_TYPES: VoiceType[] = [
  'male-tenor', 'male-baritone', 'female-soprano', 'female-alto', 'custom'
];

export const GenerationPanel: React.FC = () => {
  const { addTrack, addGenerationRequest, userPreferences } = useMusicStore();

  const [generationType, setGenerationType] = useState<'text' | 'lyrics' | 'audio' | 'sample'>('text');
  const [prompt, setPrompt] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>('suno-v5');
  const [selectedGenre, setSelectedGenre] = useState<MusicGenre>('pop');
  const [selectedMood, setSelectedMood] = useState<Mood>('happy');
  const [selectedVoice, setSelectedVoice] = useState<VoiceType>('female-soprano');
  const [tempo, setTempo] = useState(120);
  const [duration, setDuration] = useState(180);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt && !lyrics) return;

    setIsGenerating(true);

    try {
      const musicService = getMusicService();

      let track;
      if (generationType === 'text') {
        track = await musicService.generateFromText({
          id: `gen_${Date.now()}`,
          type: 'text-to-music',
          model: selectedModel,
          prompt,
          genre: selectedGenre,
          mood: selectedMood,
          voiceType: selectedVoice,
          tempo,
          duration,
          createdAt: new Date(),
          status: 'processing',
        });
      } else if (generationType === 'lyrics') {
        track = await musicService.generateFromLyrics(
          lyrics,
          selectedGenre,
          selectedMood,
          selectedVoice,
          selectedModel
        );
      }

      if (track) {
        addTrack(track);
      }
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-400" />
          AI Music Generation
        </h1>

        {/* Generation Type Selector */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setGenerationType('text')}
            className={`p-4 rounded-lg border-2 transition ${
              generationType === 'text'
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            }`}
          >
            <Music className="w-6 h-6 mx-auto mb-2 text-purple-400" />
            <span className="text-sm text-white">Text to Music</span>
          </button>

          <button
            onClick={() => setGenerationType('lyrics')}
            className={`p-4 rounded-lg border-2 transition ${
              generationType === 'lyrics'
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            }`}
          >
            <Mic className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <span className="text-sm text-white">Lyrics to Song</span>
          </button>

          <button
            onClick={() => setGenerationType('audio')}
            className={`p-4 rounded-lg border-2 transition ${
              generationType === 'audio'
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            }`}
          >
            <FileAudio className="w-6 h-6 mx-auto mb-2 text-green-400" />
            <span className="text-sm text-white">Extend Audio</span>
          </button>

          <button
            onClick={() => setGenerationType('sample')}
            className={`p-4 rounded-lg border-2 transition ${
              generationType === 'sample'
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            }`}
          >
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
            <span className="text-sm text-white">Sample to Song</span>
          </button>
        </div>

        {/* Input Area */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          {generationType === 'text' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Describe your music
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Upbeat summer pop song with catchy chorus and tropical vibes"
                className="w-full h-32 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          {generationType === 'lyrics' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Enter your lyrics
              </label>
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Verse 1:&#10;[Your lyrics here]&#10;&#10;Chorus:&#10;[Your chorus here]"
                className="w-full h-48 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          )}
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* AI Model */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              AI Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as AIModel)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              {AI_MODELS.map((model) => (
                <option key={model} value={model}>
                  {model.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Genre */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Genre
            </label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value as MusicGenre)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              {GENRES.map((genre) => (
                <option key={genre} value={genre}>
                  {genre.charAt(0).toUpperCase() + genre.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Mood
            </label>
            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value as Mood)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              {MOODS.map((mood) => (
                <option key={mood} value={mood}>
                  {mood.charAt(0).toUpperCase() + mood.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Voice Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Voice Type
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value as VoiceType)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              {VOICE_TYPES.map((voice) => (
                <option key={voice} value={voice}>
                  {voice.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Tempo */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tempo: {tempo} BPM
            </label>
            <input
              type="range"
              min="60"
              max="180"
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Duration: {duration}s
            </label>
            <input
              type="range"
              min="30"
              max="300"
              step="30"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || (!prompt && !lyrics)}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Music
            </>
          )}
        </button>
      </div>
    </div>
  );
};
