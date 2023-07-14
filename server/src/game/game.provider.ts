import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { UserRepository } from 'src/user/user.repository';
import { GameRepository } from './game.repository';
import { Game } from './game.schema';
import { Move } from '../types';
import { UserMoveDto } from './dto/usermove.dto';

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
    console.log('$#### gameid', gameId);
    let game;
    // const gameData = null;
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

  // async getData(key: string) {
  //   return this.redis.get(key);
  // }

  // async setData(key: string, value: string) {
  //   return this.redis.set(key, value);
  // }

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
    this.logger.debug('#### move data', gameId, turn, index);
    let moves: Move[] = [];

    const gameMoves = await this.redis.get(`moves-${gameId}`);

    this.logger.debug('##### game moves', gameMoves);
    moves = JSON.parse(gameMoves);
    this.logger.debug('##### moves', moves);
    moves[index] = turn;

    const { xWins, oWins, isDraw } = this.checkGameStatus(moves);

    this.logger.debug('##### x wins , owins , is draw', xWins, oWins, isDraw);
    const newTurn = turn == 'X' ? 'O' : 'X';
    const changes = {
      moves,
      newTurn,
    };

    if (!xWins && !oWins && !isDraw) {
      this.logger.debug('@@@@ no body wins continue game');
      await this.redis.set(`turn-${gameId}`, newTurn);
      await this.redis.set(`moves-${gameId}`, JSON.stringify(moves));
      this.logger.debug('##### changes', changes);

      return { changes, status: null, game: null };
    } else {
      const gameData = await this.redis.get(`game-${gameId}`);

      this.logger.debug('##### game data from redis', gameData);
      const game = JSON.parse(gameData) as Game;
      this.logger.debug('##### game data', game);
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
      this.logger.debug('##### updated game data', game);
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
    this.logger.debug('#### finish game', game);

    const updatedGame = await this.gameRepository.finishGame(
      { _id: gameId },
      game,
    );
    if (!updatedGame) return;
    this.logger.debug('##### database updated game', updatedGame);
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

    const user1 = await this.userRepository.finishGame(
      { _id: game.user1._id },
      {
        isDraw,
        winner,
        increaseScore: user1IncreaseScore,
      },
    );

    this.logger.debug('#### updated user1', user1);

    const user2 = await this.userRepository.finishGame(
      { _id: game.user2._id },
      {
        isDraw,
        winner,
        increaseScore: user2IncreaseScroe,
      },
    );

    this.logger.debug('#### updated user2', user2);
  }
}
