/**
 * Smart AI Bot Service
 * Personalized AI assistant for music production
 * Learns user preferences, analyzes productions, suggests improvements
 */

import { GoogleGenerativeAI } from '@google/genai';
import type {
  SmartBotSuggestion,
  UserPreferences,
  Project,
  GeneratedTrack,
  MusicGenre,
  Mood
} from '../../types/music';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ProductionAnalysis {
  overallQuality: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  suggestions: SmartBotSuggestion[];
  styleProfile: {
    genres: MusicGenre[];
    moods: Mood[];
    avgTempo: number;
  };
}

export class SmartBotService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private chatHistory: ChatMessage[] = [];
  private userPreferences: UserPreferences | null = null;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Initialize with user preferences
   */
  setUserPreferences(preferences: UserPreferences): void {
    this.userPreferences = preferences;
  }

  /**
   * Chat with the AI bot
   */
  async chat(message: string, context?: {
    currentProject?: Project;
    currentTrack?: GeneratedTrack;
  }): Promise<string> {
    // Build context-aware prompt
    let systemPrompt = `You are an expert music production AI assistant. You help users create, mix, and master music.`;

    if (this.userPreferences) {
      systemPrompt += `\n\nUser's favorite genres: ${this.userPreferences.favoriteGenres.join(', ')}`;
      systemPrompt += `\nUser's favorite moods: ${this.userPreferences.favoriteMoods.join(', ')}`;
    }

    if (context?.currentProject) {
      systemPrompt += `\n\nCurrent project: "${context.currentProject.name}" (${context.currentProject.bpm} BPM, ${context.currentProject.key})`;
      systemPrompt += `\nTracks: ${context.currentProject.tracks.length}`;
    }

    if (context?.currentTrack) {
      systemPrompt += `\n\nCurrent track: "${context.currentTrack.title}" (${context.currentTrack.genre}, ${context.currentTrack.bpm} BPM)`;
    }

    // Add to chat history
    this.chatHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    try {
      const chat = this.model.startChat({
        history: this.chatHistory.slice(-10).map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.8,
        },
      });

      const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${message}`);
      const response = result.response.text();

      this.chatHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      });

      return response;
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }

  /**
   * Analyze user's production history and provide insights
   */
  async analyzeProductions(projects: Project[]): Promise<ProductionAnalysis> {
    if (projects.length === 0) {
      return {
        overallQuality: 0,
        strengths: [],
        weaknesses: [],
        suggestions: [],
        styleProfile: {
          genres: [],
          moods: [],
          avgTempo: 120,
        },
      };
    }

    // Calculate statistics
    const totalTracks = projects.reduce((sum, p) => sum + p.tracks.length, 0);
    const avgTempo = projects.reduce((sum, p) => sum + p.bpm, 0) / projects.length;

    // Build analysis prompt
    const projectSummaries = projects.map(p => ({
      name: p.name,
      tracks: p.tracks.length,
      bpm: p.bpm,
      key: p.key,
    }));

    const prompt = `Analyze these music projects and provide insights:
${JSON.stringify(projectSummaries, null, 2)}

Total projects: ${projects.length}
Total tracks: ${totalTracks}
Average tempo: ${avgTempo} BPM

Provide:
1. Overall quality assessment (0-100)
2. Key strengths (3-5 points)
3. Areas for improvement (3-5 points)
4. Specific actionable suggestions

Format as JSON with keys: overallQuality, strengths, weaknesses, suggestions`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Parse AI response
      const analysis = this.parseAnalysisResponse(response);

      return {
        ...analysis,
        styleProfile: {
          genres: this.userPreferences?.favoriteGenres || [],
          moods: this.userPreferences?.favoriteMoods || [],
          avgTempo,
        },
      };
    } catch (error) {
      console.error('Production analysis error:', error);
      throw error;
    }
  }

  /**
   * Suggest improvements for current track
   */
  async suggestImprovements(track: GeneratedTrack): Promise<SmartBotSuggestion[]> {
    const prompt = `Analyze this music track and suggest improvements:

Title: ${track.title}
Genre: ${track.genre}
BPM: ${track.bpm}
Key: ${track.key}
Duration: ${track.duration}s

Provide 3-5 specific, actionable suggestions to improve the track.
Consider: arrangement, mixing, effects, instrumentation, structure.

Format as JSON array with: id, type, title, description`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      return this.parseSuggestions(response);
    } catch (error) {
      console.error('Suggestion generation error:', error);
      return [];
    }
  }

  /**
   * Generate smart replies based on context
   */
  async generateSmartReplies(context: {
    lastUserMessage: string;
    currentProject?: Project;
  }): Promise<string[]> {
    const prompt = `Generate 3 quick, helpful responses to this message: "${context.lastUserMessage}"

Context: User is working on a music production project.
${context.currentProject ? `Project: ${context.currentProject.name}` : ''}

Provide short, actionable suggestions (max 10 words each).`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Parse and return suggestions
      return response.split('\n').filter(s => s.trim()).slice(0, 3);
    } catch (error) {
      console.error('Smart reply generation error:', error);
      return [
        'Generate new track',
        'Add stems to current project',
        'Apply mixing and mastering',
      ];
    }
  }

  /**
   * Suggest genre and mood based on prompt
   */
  async analyzePrompt(prompt: string): Promise<{
    suggestedGenre: MusicGenre;
    suggestedMood: Mood;
    suggestedTempo: number;
    explanation: string;
  }> {
    const analysisPrompt = `Analyze this music generation prompt: "${prompt}"

Suggest:
1. Best genre
2. Appropriate mood
3. Ideal tempo (BPM)
4. Brief explanation

Available genres: pop, rock, hip-hop, electronic, jazz, classical, country, r&b, metal, indie, folk, blues, reggae, latin, edm
Available moods: happy, sad, energetic, calm, angry, romantic, melancholic, uplifting, dark, mysterious

Format as JSON: { genre, mood, tempo, explanation }`;

    try {
      const result = await this.model.generateContent(analysisPrompt);
      const response = result.response.text();

      // Parse response
      const data = this.parseJSON(response);

      return {
        suggestedGenre: data.genre || 'pop',
        suggestedMood: data.mood || 'happy',
        suggestedTempo: data.tempo || 120,
        explanation: data.explanation || '',
      };
    } catch (error) {
      console.error('Prompt analysis error:', error);
      return {
        suggestedGenre: 'pop',
        suggestedMood: 'happy',
        suggestedTempo: 120,
        explanation: 'Default suggestions',
      };
    }
  }

  /**
   * Get personalized track recommendations
   */
  async getRecommendations(): Promise<{
    prompt: string;
    genre: MusicGenre;
    mood: Mood;
  }[]> {
    if (!this.userPreferences) {
      return [];
    }

    const prompt = `Based on user preferences:
Favorite genres: ${this.userPreferences.favoriteGenres.join(', ')}
Favorite moods: ${this.userPreferences.favoriteMoods.join(', ')}

Generate 5 creative prompts for new music tracks.
Format as JSON array: [{ prompt, genre, mood }]`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      return this.parseJSON(response) || [];
    } catch (error) {
      console.error('Recommendation error:', error);
      return [];
    }
  }

  /**
   * Parse analysis response
   */
  private parseAnalysisResponse(response: string): {
    overallQuality: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: SmartBotSuggestion[];
  } {
    try {
      const data = this.parseJSON(response);
      return {
        overallQuality: data.overallQuality || 75,
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        suggestions: (data.suggestions || []).map((s: any, i: number) => ({
          id: `sugg_${i}`,
          type: 'improvement',
          title: s.title || s,
          description: s.description || '',
          action: () => {},
        })),
      };
    } catch {
      return {
        overallQuality: 75,
        strengths: [],
        weaknesses: [],
        suggestions: [],
      };
    }
  }

  /**
   * Parse suggestions
   */
  private parseSuggestions(response: string): SmartBotSuggestion[] {
    try {
      const data = this.parseJSON(response);
      return (Array.isArray(data) ? data : []).map((s, i) => ({
        id: s.id || `sugg_${i}`,
        type: s.type || 'improvement',
        title: s.title,
        description: s.description,
        action: () => {},
      }));
    } catch {
      return [];
    }
  }

  /**
   * Parse JSON from potentially messy AI response
   */
  private parseJSON(text: string): any {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;

    try {
      return JSON.parse(jsonText);
    } catch {
      // Try to extract JSON without code blocks
      const cleanText = text.replace(/```(?:json)?/g, '').trim();
      return JSON.parse(cleanText);
    }
  }

  /**
   * Clear chat history
   */
  clearHistory(): void {
    this.chatHistory = [];
  }

  /**
   * Get chat history
   */
  getHistory(): ChatMessage[] {
    return this.chatHistory;
  }
}

// Export singleton
let smartBotService: SmartBotService | null = null;

export const initSmartBotService = (apiKey: string) => {
  smartBotService = new SmartBotService(apiKey);
  return smartBotService;
};

export const getSmartBotService = (): SmartBotService => {
  if (!smartBotService) {
    throw new Error('SmartBotService not initialized.');
  }
  return smartBotService;
};
