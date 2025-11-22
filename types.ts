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
}

export interface Team {
  id: string;
  originalName: string; // The real name chosen (e.g., Flamengo)
  name: string; // The fictional name (e.g., Urubu Guerreiro)
  primaryColor: string;
  secondaryColor: string;
  roster: Player[];
  strength: number;
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
  LOADING = 'LOADING',
}