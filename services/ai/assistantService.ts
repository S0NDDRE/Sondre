import { GoogleGenAI } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

export class AIAssistantService {
  private static conversationHistory: string[] = [];

  static async sendMessage(message: string, context?: {
    hasMediaFile: boolean;
    mediaType?: 'image' | 'video';
    hasSelections: boolean;
    selectionsCount: number;
  }): Promise<string> {
    if (!ai) {
      return 'AI-assistenten er ikke tilgjengelig. Vennligst legg til en Gemini API-nøkkel i miljøvariablene.';
    }

    try {

      // Build context-aware prompt
      let prompt = `Du er en hjelpsom AI-assistent for Vannmerk Fjerner Pro, en app som fjerner vannmerker fra bilder og videoer.

Dine oppgaver:
- Hjelp brukere med å forstå hvordan appen fungerer
- Gi trinn-for-trinn instruksjoner på norsk
- Gi tips for beste resultater
- Svar på spørsmål om vannmerkefjerning

Gjeldende status:`;

      if (context) {
        if (context.hasMediaFile) {
          prompt += `\n- Bruker har lastet opp en ${context.mediaType === 'video' ? 'video' : 'et bilde'}`;
        } else {
          prompt += `\n- Bruker har ikke lastet opp noen fil ennå`;
        }

        if (context.hasSelections) {
          prompt += `\n- Bruker har markert ${context.selectionsCount} område(r) for fjerning`;
        } else if (context.hasMediaFile) {
          prompt += `\n- Bruker har ikke markert noen områder ennå`;
        }
      }

      prompt += `\n\nVær vennlig, konsis og hjelpsom. Svar alltid på norsk.`;

      // Add conversation history
      if (this.conversationHistory.length > 0) {
        prompt += `\n\nSamtalehistorikk:\n${this.conversationHistory.join('\n')}`;
      }

      prompt += `\n\nBruker: ${message}\nAssistent:`;

      // Generate response
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
          topP: 0.9,
        },
      });

      const responseText = response.text.trim();

      // Save to history (keep last 10 exchanges)
      this.conversationHistory.push(`Bruker: ${message}`);
      this.conversationHistory.push(`Assistent: ${responseText}`);

      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      return responseText;
    } catch (error) {
      console.error('Error sending message to AI:', error);
      return 'Beklager, jeg kunne ikke behandle forespørselen din. Vennligst prøv igjen.';
    }
  }

  static clearHistory() {
    this.conversationHistory = [];
  }

  static async getQuickTips(): Promise<string[]> {
    return [
      'For beste resultater, bruk høyoppløselige bilder',
      'Marker vannmerket så nøyaktig som mulig',
      'Bruk zoom-funksjonen for presisjon',
      'Vannmerker på enkle bakgrunner er lettere å fjerne',
      'Du kan markere flere områder samtidig',
    ];
  }

  static async suggestNextStep(context: {
    hasMediaFile: boolean;
    hasSelections: boolean;
    isProcessing: boolean;
  }): Promise<string> {
    if (!context.hasMediaFile) {
      return 'Last opp et bilde eller en video for å komme i gang!';
    }

    if (!context.hasSelections) {
      return 'Marker området med vannmerket ved å klikke "Velg Område" og dra over vannmerket, eller bruk "Automatisk Deteksjon".';
    }

    if (context.isProcessing) {
      return 'Behandler bildet... Vennligst vent.';
    }

    return 'Klikk "Fjern Vannmerke" for å starte behandlingen!';
  }
}
