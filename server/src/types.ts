export type OpenGame = {
  _id: string;
  username: string;
  score: number;
};

export type Move = 'X' | 'O' | 0;

export type UserGameFinish = {
  isDraw: boolean;
  winner: string;
  increaseScore: number;
};

export type Message = {
  message: string;
  username: string;
  timestamp: string;
};
