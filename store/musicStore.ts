/**
 * Global State Management for Music Studio
 * Using Zustand for state management
 */

import { create } from 'zustand';
import type {
  Project,
  GeneratedTrack,
  GenerationRequest,
  UserPreferences,
  CustomVoice,
  AIModel,
  Stem,
} from '../types/music';

interface MusicStudioState {
  // Projects
  projects: Project[];
  currentProject: Project | null;

  // Tracks
  generatedTracks: GeneratedTrack[];
  selectedTrack: GeneratedTrack | null;

  // Generation
  activeGenerations: GenerationRequest[];

  // User preferences
  userPreferences: UserPreferences;
  customVoices: CustomVoice[];

  // Audio playback
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;

  // UI state
  sidebarOpen: boolean;
  activeTab: 'generate' | 'studio' | 'stems' | 'export' | 'settings';
  selectedStemTypes: string[];

  // Actions - Projects
  createProject: (name: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (project: Project | null) => void;

  // Actions - Tracks
  addTrack: (track: GeneratedTrack) => void;
  updateTrack: (id: string, updates: Partial<GeneratedTrack>) => void;
  deleteTrack: (id: string) => void;
  setSelectedTrack: (track: GeneratedTrack | null) => void;

  // Actions - Generation
  addGenerationRequest: (request: GenerationRequest) => void;
  updateGenerationRequest: (id: string, updates: Partial<GenerationRequest>) => void;
  removeGenerationRequest: (id: string) => void;

  // Actions - Preferences
  updateUserPreferences: (updates: Partial<UserPreferences>) => void;
  addCustomVoice: (voice: CustomVoice) => void;
  removeCustomVoice: (id: string) => void;

  // Actions - Playback
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;

  // Actions - UI
  toggleSidebar: () => void;
  setActiveTab: (tab: MusicStudioState['activeTab']) => void;
  toggleStemType: (stemType: string) => void;
}

export const useMusicStore = create<MusicStudioState>((set) => ({
  // Initial state
  projects: [],
  currentProject: null,
  generatedTracks: [],
  selectedTrack: null,
  activeGenerations: [],
  userPreferences: {
    favoriteGenres: [],
    favoriteMoods: [],
    preferredModel: 'suno-v5',
    recentProjects: [],
    customVoices: [],
  },
  customVoices: [],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 80,
  sidebarOpen: true,
  activeTab: 'generate',
  selectedStemTypes: [],

  // Project actions
  createProject: (name) =>
    set((state) => {
      const newProject: Project = {
        id: `project_${Date.now()}`,
        name,
        tracks: [],
        bpm: 120,
        timeSignature: '4/4',
        key: 'C',
        duration: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return {
        projects: [...state.projects, newProject],
        currentProject: newProject,
      };
    }),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      ),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, ...updates, updatedAt: new Date() }
          : state.currentProject,
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    })),

  setCurrentProject: (project) => set({ currentProject: project }),

  // Track actions
  addTrack: (track) =>
    set((state) => ({
      generatedTracks: [...state.generatedTracks, track],
    })),

  updateTrack: (id, updates) =>
    set((state) => ({
      generatedTracks: state.generatedTracks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
      selectedTrack:
        state.selectedTrack?.id === id
          ? { ...state.selectedTrack, ...updates }
          : state.selectedTrack,
    })),

  deleteTrack: (id) =>
    set((state) => ({
      generatedTracks: state.generatedTracks.filter((t) => t.id !== id),
      selectedTrack: state.selectedTrack?.id === id ? null : state.selectedTrack,
    })),

  setSelectedTrack: (track) => set({ selectedTrack: track }),

  // Generation actions
  addGenerationRequest: (request) =>
    set((state) => ({
      activeGenerations: [...state.activeGenerations, request],
    })),

  updateGenerationRequest: (id, updates) =>
    set((state) => ({
      activeGenerations: state.activeGenerations.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  removeGenerationRequest: (id) =>
    set((state) => ({
      activeGenerations: state.activeGenerations.filter((r) => r.id !== id),
    })),

  // Preferences actions
  updateUserPreferences: (updates) =>
    set((state) => ({
      userPreferences: { ...state.userPreferences, ...updates },
    })),

  addCustomVoice: (voice) =>
    set((state) => ({
      customVoices: [...state.customVoices, voice],
      userPreferences: {
        ...state.userPreferences,
        customVoices: [...state.userPreferences.customVoices, voice],
      },
    })),

  removeCustomVoice: (id) =>
    set((state) => ({
      customVoices: state.customVoices.filter((v) => v.id !== id),
      userPreferences: {
        ...state.userPreferences,
        customVoices: state.userPreferences.customVoices.filter((v) => v.id !== id),
      },
    })),

  // Playback actions
  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),

  // UI actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleStemType: (stemType) =>
    set((state) => ({
      selectedStemTypes: state.selectedStemTypes.includes(stemType)
        ? state.selectedStemTypes.filter((t) => t !== stemType)
        : [...state.selectedStemTypes, stemType],
    })),
}));
