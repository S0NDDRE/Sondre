
import { GoogleGenAI, Type } from "@google/genai";
import type { Conversation, User } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Formats the conversation history into a string for the Gemini prompt.
 */
const formatConversationHistory = (conversation: Conversation, currentUserId: string): string => {
  const users = new Map(conversation.participants.map(p => [p.id, p.name]));
  return conversation.messages
    .map(message => {
      const senderName = users.get(message.senderId) || 'Unknown User';
      const prefix = message.senderId === currentUserId ? 'You' : senderName;
      return `[${prefix}]: ${message.text}`;
    })
    .join('\n');
};

/**
 * Generates smart reply suggestions for a given conversation.
 * @param conversation - The conversation object.
 * @param currentUserId - The ID of the current user.
 * @returns A promise that resolves to an array of smart reply strings.
 */
export const generateSmartReplies = async (
  conversation: Conversation,
  currentUserId: string
): Promise<string[]> => {
  const conversationHistory = formatConversationHistory(conversation, currentUserId);
  const prompt = `
    Given the following chat conversation, generate 3 short, distinct, and natural-sounding reply suggestions for "You".
    Keep them concise, like a real chat message (e.g., "Sounds good!", "I'm on it.", "What do you think?").
    Do not add any extra formatting or numbering.

    Conversation:
    ${conversationHistory}

    Generate 3 replies for "You".
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replies: {
              type: Type.ARRAY,
              description: "A list of 3 short, context-aware reply suggestions.",
              items: {
                type: Type.STRING,
                description: "A single reply suggestion."
              }
            }
          },
          required: ["replies"]
        },
        temperature: 0.8,
        topP: 0.95,
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);

    if (parsed && Array.isArray(parsed.replies)) {
      return parsed.replies.slice(0, 3); // Ensure we only return up to 3 replies
    }
    
    return [];

  } catch (error) {
    console.error("Error generating smart replies:", error);
    throw new Error("Failed to communicate with the Gemini API.");
  }
};
   