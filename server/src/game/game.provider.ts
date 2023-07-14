import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { GameRepository } from './game.repository';
import { Game } from './game.schema';

@Injectable()
export class GameProvider {
  private readonly redis: Redis;
  private readonly logger = new Logger(GameProvider.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly gameRepository: GameRepository,
  ) {
    this.redis = this.redisService.getClient();
  }

  async getGameData(gameId: string): Promise<Game> {
    console.log('$#### gameid', gameId);
    let game;
    // const gameData = null;
    const gameData = await this.redis.get(`game-${gameId}`);
    this.logger.log('#### get game data from redis', gameData);
    if (gameData) {
      game = JSON.parse(gameData);
      this.logger.debug('#@##### game data', game);
    } else {
      game = await this.gameRepository.findOne({ _id: gameId });
      console.log('#### game', game);
      const stringData = JSON.stringify(game);
      this.redis.set(`game-${gameId}`, stringData);
    }

    return game;
  }

  async getGameMoves(gameId: string) {
    let moves = [0, 0, 0, 0, 0, 0, 0, 0, 0];

    const movesData = await this.redis.get(`moves-${gameId}`);
    console.log('#### moves', movesData);
    if (movesData) {
      moves = JSON.parse(movesData);
    } else {
      this.redis.set(`moves-${gameId}`, JSON.stringify(moves));
    }

    return moves;
  }
}
