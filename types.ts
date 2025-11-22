
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

export interface SocialPost {
  id: string;
  authorName: string;
  content: string;
  likes: number;
  comments: number;
  liked: boolean;
}

export interface MatchResult {
  opponentName: string;
  userScore: number;
  opponentScore: number;
  commentary: string[];
  win: boolean;
  draw: boolean;
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
}
