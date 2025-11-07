/**
 * AI Music Generation Studio
 * Main Application Component
 */

import React, { useEffect } from 'react';
import { StudioNav } from './components/studio/StudioNav';
import { GenerationPanel } from './components/studio/GenerationPanel';
import { MultitrackStudio } from './components/studio/MultitrackStudio';
import { useMusicStore } from './store/musicStore';
import { initMusicService } from './services/music/musicGenerationService';
import { initStemService } from './services/audio/stemSeparationService';
import { initVoiceService } from './services/voice/voiceService';
import { initMidiService } from './services/midi/midiService';
import { initMixingService } from './services/audio/mixingMasteringService';
import { initSmartBotService } from './services/ai/smartBotService';

export const StudioApp: React.FC = () => {
  const { activeTab } = useMusicStore();

  useEffect(() => {
    // Initialize all services
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

    try {
      initMusicService(apiKey);
      initStemService(apiKey);
      initVoiceService(apiKey);
      initMidiService(apiKey);
      initMixingService(apiKey);
      initSmartBotService(apiKey);

      console.log('AI Music Studio services initialized');
    } catch (error) {
      console.error('Failed to initialize services:', error);
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'generate':
        return <GenerationPanel />;

      case 'studio':
        return <MultitrackStudio />;

      case 'stems':
        return <StemsPanel />;

      case 'export':
        return <ExportPanel />;

      case 'settings':
        return <SettingsPanel />;

      default:
        return <GenerationPanel />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      <StudioNav />
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

// Placeholder components for other tabs
const StemsPanel: React.FC = () => (
  <div className="flex-1 flex items-center justify-center p-6">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Stem Separation</h2>
      <p className="text-slate-400 mb-6">
        Upload audio to separate into individual stems (vocals, drums, bass, etc.)
      </p>
      <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
        Upload Audio
      </button>
    </div>
  </div>
);

const ExportPanel: React.FC = () => {
  const { generatedTracks } = useMusicStore();

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Export Tracks</h2>
      <div className="grid grid-cols-1 gap-4 max-w-4xl">
        {generatedTracks.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No tracks to export. Generate some music first!
          </div>
        ) : (
          generatedTracks.map((track) => (
            <div key={track.id} className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{track.title}</h3>
                  <p className="text-sm text-slate-400">
                    {track.genre} • {track.bpm} BPM • {track.key}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
                    Export MP3
                  </button>
                  <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">
                    Export WAV
                  </button>
                  <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">
                    Export MIDI
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const SettingsPanel: React.FC = () => {
  const { userPreferences, updateUserPreferences } = useMusicStore();

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
      <div className="max-w-2xl">
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Preferred AI Model
              </label>
              <select
                value={userPreferences.preferredModel}
                onChange={(e) =>
                  updateUserPreferences({ preferredModel: e.target.value as any })
                }
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              >
                <option value="suno-v5">Suno V5</option>
                <option value="suno-v4.5">Suno V4.5</option>
                <option value="udio-allegro-v1.5">Udio Allegro V1.5</option>
                <option value="stable-audio">Stable Audio</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Favorite Genres
              </label>
              <p className="text-sm text-slate-400">
                {userPreferences.favoriteGenres.join(', ') || 'None selected'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">API Keys</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Gemini API Key
              </label>
              <input
                type="password"
                placeholder="Enter your API key"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
