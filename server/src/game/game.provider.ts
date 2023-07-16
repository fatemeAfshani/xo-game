import * as moment from 'moment-jalaali';

import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { UserRepository } from 'src/user/user.repository';
import { GameRepository } from './game.repository';
import { Game } from './game.schema';
import { Message, Move } from '../types';
import { UserMoveDto } from './dto/usermove.dto';
import { NewMessageDto } from './dto/newMessage.dto';

@Injectable()
export class GameProvider {
  private readonly winningPossibilities = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  private readonly redis: Redis;
  private readonly logger = new Logger(GameProvider.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly gameRepository: GameRepository,
    private readonly userRepository: UserRepository,
  ) {
    this.redis = this.redisService.getClient();
  }

  async getGameData(gameId: string): Promise<Game> {
    let game;
    const gameData = await this.redis.get(`game-${gameId}`);
    if (gameData) {
      game = JSON.parse(gameData);
    } else {
      game = await this.gameRepository.findOne({ _id: gameId });
      const stringData = JSON.stringify(game);
      this.redis.set(`game-${gameId}`, stringData);
    }
    return game;
  }

  async getGameMoves(gameId: string): Promise<Move[]> {
    let moves: Move[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    const movesData = await this.redis.get(`moves-${gameId}`);
    if (movesData) {
      moves = JSON.parse(movesData);
    } else {
      this.redis.set(`moves-${gameId}`, JSON.stringify(moves));
    }
    return moves;
  }

  async getGameTurn(gameId) {
    let turn = 'X';
    const turnData = await this.redis.get(`turn-${gameId}`);
    if (turnData) {
      turn = turnData;
    } else {
      this.redis.set(`turn-${gameId}`, turn);
    }
    return turn;
  }

  private checkGameStatus(moves: Move[]) {
    const xWins = this.winningPossibilities.some((posibility) => {
      return posibility.every((index) => {
        return moves[index] == 'X';
      });
    });
    const oWins = this.winningPossibilities.some((posibility) => {
      return posibility.every((index) => {
        return moves[index] == 'O';
      });
    });

    const isDraw = moves.every((move) => {
      return move !== 0;
    });
    return {
      xWins,
      oWins,
      isDraw,
    };
  }

  async userMove({ gameId, turn, index }: UserMoveDto): Promise<{
    changes: { moves: Move[]; newTurn: string };
    status: string | null;
    game: Game | null;
  }> {
    let moves: Move[] = [];
    const gameMoves = await this.redis.get(`moves-${gameId}`);
    moves = JSON.parse(gameMoves);
    moves[index] = turn;
    const { xWins, oWins, isDraw } = this.checkGameStatus(moves);
    const newTurn = turn == 'X' ? 'O' : 'X';
    const changes = {
      moves,
      newTurn,
    };

    if (!xWins && !oWins && !isDraw) {
      await this.redis.set(`turn-${gameId}`, newTurn);
      await this.redis.set(`moves-${gameId}`, JSON.stringify(moves));
      return { changes, status: null, game: null };
    } else {
      const gameData = await this.redis.get(`game-${gameId}`);
      const game = JSON.parse(gameData) as Game;
      let status = '';
      game.roundsCount += 1;

      if (xWins) {
        game.user1Wins += 1;
        status = `user ${game.user1.username} wins`;
      } else if (oWins) {
        game.user2Wins += 1;
        status = `user ${game.user2.username} wins`;
      } else if (isDraw) {
        game.drawsCount += 1;
        status = 'Draw';
      }
      await this.redis.set(`game-${gameId}`, JSON.stringify(game));
      return { changes, status, game };
    }
  }

  async continueGame(
    gameId: string,
  ): Promise<{ moves: number[]; turn: 'X'; game: Game }> {
    const moves = [0, 0, 0, 0, 0, 0, 0, 0, 0];

    this.redis.set(`moves-${gameId}`, JSON.stringify(moves));
    this.redis.set(`turn-${gameId}`, 'X');
    const gameData = await this.redis.get(`game-${gameId}`);
    const game = JSON.parse(gameData);
    return { moves, turn: 'X', game };
  }

  async finishGame(gameId: string) {
    const gameData = await this.redis.get(`game-${gameId}`);
    const game: Game = JSON.parse(gameData);
    const updatedGame = await this.gameRepository.finishGame(
      { _id: gameId },
      game,
    );
    if (!updatedGame) return;
    let isDraw = false;
    let winner;
    let user1IncreaseScore = 0;
    let user2IncreaseScroe = 0;

    if (game.user1Wins == game.user2Wins) {
      isDraw = true;
      user1IncreaseScore = 5;
      user2IncreaseScroe = 5;
    } else if (game.user1Wins > game.user2Wins) {
      winner = game.user1._id;
      user1IncreaseScore = 10;
    } else {
      winner = game.user2._id;
      user2IncreaseScroe = 10;
    }
    await this.userRepository.finishGame(
      { _id: game.user1._id },
      {
        isDraw,
        winner,
        increaseScore: user1IncreaseScore,
      },
    );
    await this.userRepository.finishGame(
      { _id: game.user2._id },
      {
        isDraw,
        winner,
        increaseScore: user2IncreaseScroe,
      },
    );
  }

  async handleNewMessage({
    gameId,
    username,
    message,
  }: NewMessageDto): Promise<Message> {
    const formatedMessage = {
      username,
      message,
      timestamp: moment().format('jYYYY/jM/jD HH:mm:ss'),
    };
    let messages = [];
    const messagesData = await this.redis.get(`messages-${gameId}`);
    if (messagesData) {
      messages = JSON.parse(messagesData);
    }
    messages.push(formatedMessage);
    await this.redis.set(`messages-${gameId}`, JSON.stringify(messages));
    return formatedMessage;
  }

  async getMessagesHistory(gameId: string): Promise<Message[]> {
    const messagesData = await this.redis.get(`messages-${gameId}`);
    if (messagesData) {
      return JSON.parse(messagesData);
    }
    return [];
  }

  async getOpenGameTtl(gameId: string): Promise<number> {
    const ttl = await this.redis.ttl(`open-game-${gameId}`);
    if (ttl > 0) {
      return ttl;
    }

    return 0;
  }
}
