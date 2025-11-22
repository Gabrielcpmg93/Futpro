
import { GoogleGenAI, Type } from "@google/genai";
import { Team, Player, Position, SocialPost } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// Using gemini-2.0-flash-exp as it is stable and fast
const MODEL_NAME = "gemini-2.0-flash-exp";

// Hardcoded mapping to ensure fictional names for the specific list provided
export const COPA_TEAMS_MAPPING: Record<string, string> = {
  "Deportivo Táchira": "Táchira Aurinegro",
  "Carabobo": "Granada FC",
  "Peñarol": "Carboneros do Sul",
  "Alianza Lima": "Aliança Real",
  "Sporting Cristal": "Cristal Celeste",
  "Universitário": "Acadêmicos de Lima",
  "Nacional": "Tricolor Nacional",
  "Cerro Porteño": "Ciclón de Barrio",
  "Olimpia": "Rei de Copas",
  "Libertad": "Liberdade Gumarelo",
  "Barcelona de Guayaquil": "Toreros SC",
  "Independiente del Valle": "Negriazul do Vale",
  "LDU Quito": "Universitária de Quito",
  "Atlético Nacional": "Verde da Montanha",
  "Atlético Bucaramanga": "Leopardos FC",
  "Universidad de Chile": "Coruja Universitária",
  "Colo-Colo": "Cacique Eterno",
  "Bolívar": "Celeste de La Paz",
  "San Antonio Bulo Bulo": "Santo Antônio FC",
  "Flamengo": "Urubu Guerreiro",
  "Cruzeiro": "Raposa Celeste",
  "Bahia": "Tricolor de Aço",
  "São Paulo": "Soberano FC",
  "Internacional": "Colorado do Sul",
  "Fortaleza": "Leão do Pici",
  "Palmeiras": "Porco Alviverde",
  "Botafogo": "Estrela Solitária",
  "River Plate": "Rio de Prata",
  "Talleres": "Talleres de Córdoba",
  "Central de Córdoba": "Ferroviário Central",
  "Racing": "Academia de Avellaneda",
  "Estudiantes": "Pincharratas",
  "Vélez Sarsfield": "Fortim de Liniers"
};

export const generateFictionalTeam = async (realTeamName: string): Promise<Team> => {
  // Check if we have a hardcoded mapping first
  let fictionalName = COPA_TEAMS_MAPPING[realTeamName];
  
  const ai = getAiClient();
  
  if (!ai) {
    return mockTeamGeneration(realTeamName, fictionalName);
  }

  try {
    // Ask AI to generate details, but use our hardcoded name if available
    const prompt = `
      Create a fictional football team based on "${realTeamName}".
      ${fictionalName ? `The name MUST be "${fictionalName}".` : 'Create a creative fictional name in Portuguese.'}
      2. Provide hex codes for primary/secondary colors.
      3. Generate a list of 24 fictional players (GK, DEF, MID, FWD).
         - Names must be creative Brazilian nicknames.
         - Rating 60-95.
         - Age 17-35.
         - Market value (in millions, e.g. 1.5, 10.0).
      
      Output JSON.
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
                  marketValue: { type: Type.NUMBER }
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
      salary: Math.floor(p.rating * 1500), // Simple salary formula
      contractWeeks: Math.floor(Math.random() * 100) + 20,
      marketValue: p.marketValue || 1.0
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
      budget: 50000000, // 50M budget start
      trophies: []
    };

  } catch (error) {
    console.error("Error generating team:", error);
    return mockTeamGeneration(realTeamName, fictionalName);
  }
};

export const generateSocialPosts = (teamName: string): SocialPost[] => {
  return [
    { id: '1', authorName: "Capitão Silva", content: `Grande treino hoje com o ${teamName}! Estamos prontos.`, likes: 120, comments: 45, liked: false },
    { id: '2', authorName: "Torcida Organizada", content: "Queremos raça amanhã! Vamos pra cima!", likes: 890, comments: 120, liked: false },
    { id: '3', authorName: "Jornal da Bola", content: `Rumores dizem que o ${teamName} busca reforços no mercado.`, likes: 50, comments: 10, liked: false },
  ];
};

export const generateMarketPlayers = (): Player[] => {
  const positions = [Position.FWD, Position.MID, Position.DEF, Position.GK];
  return Array.from({ length: 10 }).map((_, i) => ({
    id: `market-${i}`,
    name: `Jogador Alvo ${i+1}`,
    position: positions[i % 4],
    rating: 70 + Math.floor(Math.random() * 20),
    age: 18 + Math.floor(Math.random() * 15),
    salary: 10000 + Math.floor(Math.random() * 50000),
    contractWeeks: 52,
    marketValue: 2 + Math.floor(Math.random() * 10)
  }));
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

// Fallback
const mockTeamGeneration = (realName: string, fictionalName?: string): Team => {
  const name = fictionalName || `Nova ${realName}`;
  return {
    id: "mock-1",
    originalName: realName,
    name: name,
    primaryColor: "#1e3a8a",
    secondaryColor: "#fbbf24",
    strength: 75,
    budget: 50000000,
    trophies: [],
    roster: Array.from({ length: 24 }).map((_, i) => ({
      id: `${i}`,
      name: `Jogador ${i}`,
      position: i === 0 ? Position.GK : i < 8 ? Position.DEF : i < 16 ? Position.MID : Position.FWD,
      rating: 70 + Math.floor(Math.random() * 20),
      age: 18 + Math.floor(Math.random() * 15),
      salary: 25000,
      contractWeeks: 48,
      marketValue: 5.0
    }))
  };
};
