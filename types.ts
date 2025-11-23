
export enum Position {
  GK = 'GK',
  DEF = 'DEF',
  MID = 'MID',
  FWD = 'FWD',
}

export interface Player {
  id: string;
  name: string;
  position: Position;
  rating: number; // 1-99
  age: number;
  salary: number; // Weekly salary
  contractWeeks: number;
  marketValue: number;
}

export interface Team {
  id: string;
  originalName: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  roster: Player[];
  strength: number;
  budget: number;
  trophies: string[];
}

export interface SocialInteraction {
  userComment: string;
  playerReply: string | null; // null indicates loading/typing
}

export interface SocialPost {
  id: string;
  authorName: string;
  content: string;
  likes: number;
  comments: number;
  liked: boolean;
  interactions: SocialInteraction[];
}

export interface MatchResult {
  opponentName: string;
  userScore: number;
  opponentScore: number;
  commentary: string[];
  win: boolean;
  draw: boolean;
}

export interface LeagueTeam {
  id: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  gf: number; // Goals For
  ga: number; // Goals Against
  isUser: boolean;
}

export interface NewsArticle {
  headline: string;
  subheadline: string;
  content: string;
  date: string;
  imageCaption: string;
}

export enum ScreenState {
  SELECT_TEAM = 'SELECT_TEAM',
  HOME = 'HOME',
  SQUAD = 'SQUAD',
  MATCH = 'MATCH',
  FRIENDLY_SETUP = 'FRIENDLY_SETUP',
  SOCIAL = 'SOCIAL',
  MARKET = 'MARKET',
  COPA_AMERICAS = 'COPA_AMERICAS',
  CAREER_MODE = 'CAREER_MODE',
  LOADING = 'LOADING',
  PLAY_HUB = 'PLAY_HUB',
  LEAGUE_TABLE = 'LEAGUE_TABLE',
  NEWS = 'NEWS',
}