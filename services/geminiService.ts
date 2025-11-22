import { GoogleGenAI, Type } from "@google/genai";
import { Team, Player, Position } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to generate a random ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Using gemini-2.0-flash-exp as fallback if 2.5 is not available
const MODEL_NAME = "gemini-2.0-flash-exp";

export const generateFictionalTeam = async (realTeamName: string): Promise<Team> => {
  const ai = getAiClient();
  
  // Fallback if no API key
  if (!ai) {
    return mockTeamGeneration(realTeamName);
  }

  try {
    const prompt = `
      Create a fictional football team inspired by the Brazilian team "${realTeamName}".
      1. Give it a creative fictional name (in Portuguese) that is different from the real name but thematically related.
      2. Provide hex codes for a primary and secondary color based on the real team.
      3. Generate a list of 11 fictional players with:
         - Creative Brazilian-style nicknames or names (NOT real players).
         - Positions (GK, DEF, MID, FWD).
         - Rating (integer 60-95).
         - Age (17-38).
      
      The output must be valid JSON.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fictionalName: { type: Type.STRING },
            primaryColor: { type: Type.STRING },
            secondaryColor: { type: Type.STRING },
            players: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  position: { type: Type.STRING, enum: ["GK", "DEF", "MID", "FWD"] },
                  rating: { type: Type.INTEGER },
                  age: { type: Type.INTEGER },
                },
              },
            },
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text");

    const data = JSON.parse(text);

    const roster: Player[] = (data.players || []).map((p: any) => ({
      id: generateId(),
      name: p.name,
      position: p.position as Position,
      rating: p.rating,
      age: p.age,
    }));

    const teamStrength = Math.floor(roster.reduce((acc, p) => acc + p.rating, 0) / roster.length);

    return {
      id: generateId(),
      originalName: realTeamName,
      name: data.fictionalName || `${realTeamName} Fictício`,
      primaryColor: data.primaryColor || "#000000",
      secondaryColor: data.secondaryColor || "#ffffff",
      roster: roster,
      strength: teamStrength,
    };

  } catch (error) {
    console.error("Error generating team:", error);
    return mockTeamGeneration(realTeamName);
  }
};

export const simulateMatchCommentary = async (userTeamName: string, opponentName: string): Promise<string[]> => {
  const ai = getAiClient();
  if (!ai) return ["Jogo emocionante!", "Grande defesa!", "Fim de jogo."];

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Write 3 short, exciting soccer match commentary lines (in Portuguese) for a match between ${userTeamName} and ${opponentName}. DO NOT include the score. Just action.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    const text = response.text;
    const lines = text ? JSON.parse(text) : [];
    return lines.length > 0 ? lines : ["A bola rola no gramado!", "Lance perigoso!", "O juiz apita o fim."];
  } catch (e) {
    console.error("Error generating commentary:", e);
    return ["A torcida vibra!", "Bate e rebate na área...", "Que jogo tenso!"];
  }
}

// Fallback for offline/no-key development
const mockTeamGeneration = (realName: string): Team => {
  return {
    id: "mock-1",
    originalName: realName,
    name: `Nova ${realName}`,
    primaryColor: "#1e3a8a",
    secondaryColor: "#fbbf24",
    strength: 75,
    roster: [
      { id: "1", name: "Paredão Silva", position: Position.GK, rating: 80, age: 28 },
      { id: "2", name: "Betão Zaga", position: Position.DEF, rating: 75, age: 30 },
      { id: "3", name: "Maestrinho", position: Position.MID, rating: 85, age: 24 },
      { id: "4", name: "Foguete Jr", position: Position.FWD, rating: 82, age: 21 },
      { id: "5", name: "Xerife", position: Position.DEF, rating: 78, age: 32 },
    ]
  };
};