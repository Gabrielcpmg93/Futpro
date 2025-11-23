
import { GoogleGenAI, Type } from "@google/genai";
import { Team, Player, Position, SocialPost, LeagueTeam, NewsArticle } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing, using offline mode");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// Use gemini-2.5-flash for better stability and instruction compliance
const MODEL_NAME = "gemini-2.5-flash";

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

const FIRST_NAMES = ["Lucas", "Matheus", "Gabriel", "Enzo", "Pedro", "João", "Rafael", "Gustavo", "Felipe", "Bruno", "Thiago", "Diego", "Rodrigo", "André", "Eduardo", "Caio", "Vinícius", "Leonardo", "Igor", "Marcelo", "Yuri", "Kauan", "Pablo"];
const LAST_NAMES = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa", "Nascimento", "Batista"];

const getRandomName = () => {
    const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    return `${first} ${last}`;
};

export const generateFictionalTeam = async (teamNameInput: string): Promise<Team> => {
  // Check if input is already a fictional name (from mapping values)
  const isFictionalInput = Object.values(SERIE_A_MAPPING).includes(teamNameInput) || Object.values(COPA_TEAMS_MAPPING).includes(teamNameInput);
  
  let realTeamName = teamNameInput;
  let fictionalName = teamNameInput;

  if (!isFictionalInput) {
      // If input is "Flamengo", find "Urubu Guerreiro"
      fictionalName = COPA_TEAMS_MAPPING[teamNameInput] || SERIE_A_MAPPING[teamNameInput];
  } else {
      // If input is "Urubu Guerreiro", keep it as fictionalName.
      // Try to find original name for context if possible, otherwise use input
      const foundReal = Object.keys(SERIE_A_MAPPING).find(key => SERIE_A_MAPPING[key] === teamNameInput);
      if (foundReal) realTeamName = foundReal;
  }
  
  const ai = getAiClient();
  
  // Helper to generate youth players locally to save API tokens/complexity
  const generateYouth = (): Player[] => {
      return Array.from({ length: 6 }).map((_, i) => ({
          id: `youth-${generateId()}`,
          name: getRandomName(),
          position: i % 2 === 0 ? Position.MID : (i % 3 === 0 ? Position.FWD : Position.DEF),
          rating: 55 + Math.floor(Math.random() * 10), // Lower rating for youth
          age: 17 + Math.floor(Math.random() * 4), // 17-20 years old
          salary: 2000,
          contractWeeks: 104, // Long contract
          marketValue: 0.5 + Math.random() // Low value initially
      }));
  };
  
  if (!ai) {
    return mockTeamGeneration(realTeamName, fictionalName);
  }

  try {
    // Ask AI to generate only 5 key players to keep response small and prevent JSON truncation
    const prompt = `
      Create a fictional football team based on the style of "${realTeamName}".
      ${fictionalName ? `The team name MUST be "${fictionalName}".` : 'Create a creative fictional name in Portuguese.'}
      
      Requirements:
      1. Provide hex codes for primary/secondary colors.
      2. Generate exactly 5 KEY players (The stars/leaders of the team).
         - Names: Creative Brazilian nicknames preferred.
         - Rating: 80-95.
         - Age: 17-35.
         - Market value: float (millions).
      
      Output concise JSON.
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
                  position: { type: Type.STRING },
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

    let text = response.text;
    if (!text) throw new Error("No response text");

    // Clean potential markdown formatting just in case
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const data = JSON.parse(text);

    // 1. Add AI generated stars with position normalization
    const roster: Player[] = (data.keyPlayers || []).map((p: any) => {
       let pos = Position.MID;
       // Loose matching for position safety
       const pStr = (p.position || "").toUpperCase();
       if (pStr.includes("GK") || pStr.includes("GOAL")) pos = Position.GK;
       else if (pStr.includes("DEF") || pStr.includes("BACK") || pStr.includes("ZAG")) pos = Position.DEF;
       else if (pStr.includes("FWD") || pStr.includes("ATT") || pStr.includes("ATA")) pos = Position.FWD;

       return {
          id: generateId(),
          name: p.name,
          position: pos,
          rating: p.rating,
          age: p.age,
          salary: Math.floor(p.rating * 1500),
          contractWeeks: 40, 
          marketValue: p.marketValue || 5.0
       };
    });

    // 2. Fill the rest to reach 24 players programmatically
    // This prevents token limit errors from the AI
    const targetCount = 24;
    const currentCount = roster.length;
    
    for (let i = currentCount; i < targetCount; i++) {
         let pos = Position.MID;
         // Ensure basics covered
         if (i < currentCount + 2) pos = Position.GK; 
         else if (i < currentCount + 8) pos = Position.DEF;
         else if (i < currentCount + 14) pos = Position.MID;
         else pos = Position.FWD;

         roster.push({
            id: generateId(),
            name: getRandomName(),
            position: pos,
            rating: 65 + Math.floor(Math.random() * 15), // Lower rating for fillers
            age: 18 + Math.floor(Math.random() * 15),
            salary: 10000 + Math.floor(Math.random() * 10000),
            contractWeeks: 40,
            marketValue: 1.0 + Math.random() * 3
         });
    }

    // Ensure at least one GK
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
      youthAcademy: generateYouth(),
      strength: teamStrength,
      budget: 50000000, // 50M budget start
      trophies: []
    };

  } catch (error: any) {
    // Handle permission denied or other API errors gracefully
    const isPermissionError = error.toString().includes("403") || 
                             (error.status === 403) || 
                             (error.message && error.message.includes("PERMISSION_DENIED"));
                             
    if (isPermissionError) {
        console.warn("Gemini API Permission Denied (403). Check your API key permissions. Falling back to offline generation.");
    } else {
        console.error("Error generating team with AI:", error);
    }
    // Fallback if AI fails completely
    return mockTeamGeneration(realTeamName, fictionalName);
  }
};

export const generateSocialPosts = (teamName: string): SocialPost[] => {
  return [
    { id: '1', authorName: "Capitão Silva", content: `Grande treino hoje com o ${teamName}! Estamos prontos.`, likes: 120, comments: 45, liked: false, interactions: [] },
    { id: '2', authorName: "Torcida Organizada", content: "Queremos raça amanhã! Vamos pra cima!", likes: 890, comments: 120, liked: false, interactions: [] },
    { id: '3', authorName: "Jornal da Bola", content: `Rumores dizem que o ${teamName} busca reforços no mercado.`, likes: 50, comments: 10, liked: false, interactions: [] },
  ];
};

export const generatePlayerReply = async (authorName: string, postContent: string, userComment: string): Promise<string> => {
  const ai = getAiClient();
  const defaultReply = "Valeu pelo apoio! ⚽";

  if (!ai) return defaultReply;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `
        You are a football player named "${authorName}". 
        You posted this on social media: "${postContent}".
        A fan commented: "${userComment}".
        
        Write a short reply (max 20 words) in Portuguese to this fan. 
        Be informal, authentic, and match the context. Use emojis if appropriate.
      `,
    });
    
    return response.text?.trim() || defaultReply;
  } catch (e: any) {
    const isPermissionError = e.toString().includes("403") || (e.status === 403);
    if (!isPermissionError) {
        console.error("Error generating reply:", e);
    }
    return defaultReply;
  }
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
      contents: `Write 8 short, exciting soccer match commentary lines (in Portuguese) for ${userTeamName} vs ${opponentName}.`,
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
  } catch (e: any) {
    const isPermissionError = e.toString().includes("403") || (e.status === 403);
    if (!isPermissionError) {
         console.error("Error generating commentary:", e);
    }
    return defaults;
  }
}

// --- NEWS GENERATION ---
export const generatePostMatchNews = async (userTeam: string, opponent: string, userScore: number, opponentScore: number): Promise<NewsArticle> => {
  const ai = getAiClient();
  const result = userScore > opponentScore ? "win" : userScore < opponentScore ? "loss" : "draw";
  
  const today = new Date().toLocaleDateString('pt-BR');
  const defaultArticle: NewsArticle = {
      headline: `Resultado da Rodada: ${userTeam} ${userScore}x${opponentScore} ${opponent}`,
      subheadline: "Partida movimentada agita a torcida neste fim de semana.",
      content: `O confronto entre ${userTeam} e ${opponent} terminou com o placar de ${userScore} a ${opponentScore}. Foi um jogo disputado onde ambas as equipes buscaram o resultado. O técnico do ${userTeam} deve avaliar o desempenho para os próximos desafios.`,
      date: today,
      imageCaption: "Jogadores disputam a bola no meio de campo."
  };

  if (!ai) return defaultArticle;

  try {
      const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: `
              Write a short, sensationalist sports newspaper article (in Portuguese) about the match: ${userTeam} (${userScore}) vs ${opponent} (${opponentScore}).
              Context: The user manages ${userTeam}. Result was a ${result}.
              
              Return JSON format with:
              - headline: catchy title (max 8 words)
              - subheadline: brief summary (max 15 words)
              - content: The article body (approx 60 words). Be dramatic.
              - imageCaption: Description of an imaginary photo of the match.
          `,
          config: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      headline: { type: Type.STRING },
                      subheadline: { type: Type.STRING },
                      content: { type: Type.STRING },
                      imageCaption: { type: Type.STRING }
                  }
              }
          }
      });

      const text = response.text;
      if (!text) return defaultArticle;
      
      const data = JSON.parse(text);
      return {
          headline: data.headline,
          subheadline: data.subheadline,
          content: data.content,
          date: today,
          imageCaption: data.imageCaption
      };

  } catch (error: any) {
      console.warn("Error generating news:", error);
      return defaultArticle;
  }
};

const mockTeamGeneration = (realName: string, fictionalName?: string): Team => {
  const name = fictionalName || `Nova ${realName}`;
  const roster = Array.from({ length: 24 }).map((_, i) => ({
      id: `${i}`,
      name: getRandomName(),
      position: i === 0 ? Position.GK : i < 8 ? Position.DEF : i < 16 ? Position.MID : Position.FWD,
      rating: 70 + Math.floor(Math.random() * 20),
      age: 18 + Math.floor(Math.random() * 15),
      salary: 25000,
      contractWeeks: 40,
      marketValue: 5.0
    }));

  const youthAcademy = Array.from({ length: 6 }).map((_, i) => ({
      id: `youth-${i}`,
      name: getRandomName(),
      position: i % 2 === 0 ? Position.MID : (i % 3 === 0 ? Position.FWD : Position.DEF),
      rating: 55 + Math.floor(Math.random() * 10),
      age: 17 + Math.floor(Math.random() * 4),
      salary: 2000,
      contractWeeks: 104,
      marketValue: 0.5 + Math.random()
  }));

  return {
    id: "mock-1",
    originalName: realName,
    name: name,
    primaryColor: "#1e3a8a",
    secondaryColor: "#fbbf24",
    strength: 75,
    budget: 50000000,
    trophies: [],
    roster: roster,
    youthAcademy: youthAcademy
  };
};

// --- LEAGUE FUNCTIONS ---

export const generateLeagueTable = (userTeam: Team): LeagueTeam[] => {
    const leagueTeams: LeagueTeam[] = [];
    const fictionalNames = Object.values(SERIE_A_MAPPING);

    // Add user team
    leagueTeams.push({
        id: userTeam.id,
        name: userTeam.name,
        played: 0, won: 0, drawn: 0, lost: 0, points: 0, gf: 0, ga: 0,
        isUser: true
    });

    // Add CPU teams (filter out user team name if it exists in mapping to avoid duplicate)
    fictionalNames.forEach((name, index) => {
        if (name !== userTeam.name) {
            leagueTeams.push({
                id: `cpu-team-${index}`,
                name: name,
                played: 0, won: 0, drawn: 0, lost: 0, points: 0, gf: 0, ga: 0,
                isUser: false
            });
        }
    });

    // Ensure 20 teams (if user team wasn't in mapping, we might have 21, so trim or if user selected one from mapping, we have 20)
    return leagueTeams.slice(0, 20);
};

export const updateLeagueTable = (
    currentTable: LeagueTeam[], 
    userResult: 'win' | 'loss' | 'draw', 
    userGoalsFor: number, 
    userGoalsAgainst: number
): LeagueTeam[] => {
    return currentTable.map(team => {
        if (team.isUser) {
            return {
                ...team,
                played: team.played + 1,
                won: team.won + (userResult === 'win' ? 1 : 0),
                drawn: team.drawn + (userResult === 'draw' ? 1 : 0),
                lost: team.lost + (userResult === 'loss' ? 1 : 0),
                points: team.points + (userResult === 'win' ? 3 : (userResult === 'draw' ? 1 : 0)),
                gf: team.gf + userGoalsFor,
                ga: team.ga + userGoalsAgainst
            };
        } else {
            // Simulate CPU match
            // Simple simulation: random result
            const r = Math.random();
            let res: 'win' | 'loss' | 'draw';
            let gf = 0;
            let ga = 0;

            if (r < 0.35) { // Win
                res = 'win';
                gf = Math.floor(Math.random() * 3) + 1;
                ga = Math.floor(Math.random() * gf);
            } else if (r < 0.65) { // Loss
                res = 'loss';
                ga = Math.floor(Math.random() * 3) + 1;
                gf = Math.floor(Math.random() * ga);
            } else { // Draw
                res = 'draw';
                gf = Math.floor(Math.random() * 2);
                ga = gf;
            }

            return {
                ...team,
                played: team.played + 1,
                won: team.won + (res === 'win' ? 1 : 0),
                drawn: team.drawn + (res === 'draw' ? 1 : 0),
                lost: team.lost + (res === 'loss' ? 1 : 0),
                points: team.points + (res === 'win' ? 3 : (res === 'draw' ? 1 : 0)),
                gf: team.gf + gf,
                ga: team.ga + ga
            };
        }
    }).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const gdA = a.gf - a.ga;
        const gdB = b.gf - b.ga;
        return gdB - gdA;
    });
};
