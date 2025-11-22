
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

// Mapping for Copa America
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
  "River Plate": "Rio de Prata"
};

// Mapping for Brasileirão Série A (Friendlies/Career)
export const SERIE_A_MAPPING: Record<string, string> = {
  "Flamengo": "Urubu Guerreiro",
  "Palmeiras": "Porco Alviverde",
  "São Paulo": "Soberano FC",
  "Corinthians": "Timão do Povo",
  "Fluminense": "Guerreiros das Laranjeiras",
  "Grêmio": "Imortal Tricolor",
  "Internacional": "Colorado do Sul",
  "Atlético Mineiro": "Galo Doido",
  "Cruzeiro": "Raposa Celeste",
  "Vasco da Gama": "Gigante da Colina",
  "Botafogo": "Estrela Solitária",
  "Bahia": "Tricolor de Aço",
  "Fortaleza": "Leão do Pici",
  "Athletico Paranaense": "Furacão da Arena",
  "Red Bull Bragantino": "Massa Bruta",
  "Cuiabá": "Dourado do Pantanal",
  "Criciúma": "Tigre Carvoeiro",
  "Juventude": "Papo da Serra",
  "Vitória": "Leão da Barra",
  "Atlético Goianiense": "Dragão do Centro"
};

const FIRST_NAMES = ["Lucas", "Matheus", "Gabriel", "Enzo", "Pedro", "João", "Rafael", "Gustavo", "Felipe", "Bruno", "Thiago", "Diego", "Rodrigo", "André", "Eduardo", "Caio", "Vinícius", "Leonardo", "Igor", "Marcelo"];
const LAST_NAMES = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa"];

const getRandomName = () => {
    const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    return `${first} ${last}`;
};

export const generateFictionalTeam = async (realTeamName: string): Promise<Team> => {
  // Check mappings
  let fictionalName = COPA_TEAMS_MAPPING[realTeamName] || SERIE_A_MAPPING[realTeamName];
  
  const ai = getAiClient();
  
  if (!ai) {
    return mockTeamGeneration(realTeamName, fictionalName);
  }

  try {
    // Ask AI to generate details, but reduce payload to prevent JSON truncation
    const prompt = `
      Create a fictional football team based on "${realTeamName}".
      ${fictionalName ? `The name MUST be "${fictionalName}".` : 'Create a creative fictional name in Portuguese.'}
      2. Provide hex codes for primary/secondary colors.
      3. Generate 5 KEY players (The stars of the team).
         - Names must be creative Brazilian nicknames.
         - Rating 80-95.
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
            keyPlayers: {
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

    // 1. Add AI generated stars
    const roster: Player[] = (data.keyPlayers || []).map((p: any) => ({
      id: generateId(),
      name: p.name,
      position: p.position as Position,
      rating: p.rating,
      age: p.age,
      salary: Math.floor(p.rating * 1500),
      contractWeeks: Math.floor(Math.random() * 100) + 20,
      marketValue: p.marketValue || 5.0
    }));

    // 2. Fill the rest to reach 24 players
    const currentCount = roster.length;
    const targetCount = 24;
    
    for (let i = currentCount; i < targetCount; i++) {
         // Distribute positions for filler players
         let pos = Position.MID;
         if (i < 3) pos = Position.GK; // Ensure we have backup GKs
         else if (i < 10) pos = Position.DEF;
         else if (i < 18) pos = Position.MID;
         else pos = Position.FWD;

         // Overwrite if first AI players covered GKs? Unlikely to have 3.
         // Just simple distribution logic for fillers:
         if (i % 4 === 0) pos = Position.DEF;
         else if (i % 4 === 1) pos = Position.MID;
         else if (i % 4 === 2) pos = Position.FWD;
         else pos = Position.GK;

         roster.push({
            id: generateId(),
            name: getRandomName(),
            position: pos,
            rating: 65 + Math.floor(Math.random() * 15), // Lower rating for fillers
            age: 18 + Math.floor(Math.random() * 15),
            salary: 10000 + Math.floor(Math.random() * 10000),
            contractWeeks: 48,
            marketValue: 1.0 + Math.random() * 3
         });
    }

    // Ensure at least one GK in the whole roster
    if (!roster.some(p => p.position === Position.GK)) {
        roster[roster.length - 1].position = Position.GK;
        roster[roster.length - 1].name = "Paredão " + roster[roster.length - 1].name.split(' ')[1];
    }

    const teamStrength = Math.floor(roster.reduce((acc, p) => acc + p.rating, 0) / roster.length);

    return {
      id: generateId(),
      originalName: realTeamName,
      name: data.fictionalName || fictionalName || `${realTeamName} Fictício`,
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
    name: getRandomName(),
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
  // Provide meaningful defaults if AI fails
  const defaults = [
      `Começa o jogo entre ${userTeamName} e ${opponentName}!`,
      `${userTeamName} troca passes no meio campo.`,
      `Chute perigoso do ${opponentName}!`,
      `Defesa espetacular do goleiro!`,
      `Fim do primeiro tempo, jogo equilibrado.`,
      `Bola rolando para o segundo tempo.`,
      `Gol!!! A torcida vai à loucura!`,
      `O árbitro apita o final da partida.`
  ];

  if (!ai) return defaults;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Write 8 short, exciting soccer match commentary lines (in Portuguese) describing key moments for a match between ${userTeamName} and ${opponentName}. DO NOT include specific scores like "2-1".`,
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
    return lines.length > 0 ? lines : defaults;
  } catch (e) {
    console.error("Error generating commentary:", e);
    return defaults;
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
      name: getRandomName(),
      position: i === 0 ? Position.GK : i < 8 ? Position.DEF : i < 16 ? Position.MID : Position.FWD,
      rating: 70 + Math.floor(Math.random() * 20),
      age: 18 + Math.floor(Math.random() * 15),
      salary: 25000,
      contractWeeks: 48,
      marketValue: 5.0
    }))
  };
};
