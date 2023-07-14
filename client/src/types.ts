/* eslint-disable no-unused-vars */
export type User = {
  _id: string;
  username: string;
  score: number;
  winCount: number;
  lossCount: number;
  drawCount: number;
};

export const enum API_ACTIONS {
  CALL_API = 'call-api',
  SUCCESS = 'success',
  ERROR = 'error',
}

export type OpenGame = {
  _id: string;
  username: string;
  score: number;
};

export type GameData = {
  user1: User;
  user2: User;
  roundsCount: number;
  user1Wins: number;
  user2Wins: number;
  drawsCount: number;
};