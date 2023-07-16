import * as config from 'config';
import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { GameRepository } from './game.repository';
import { Game } from './game.schema';
import { UserRepository } from 'src/user/user.repository';
import { Types } from 'mongoose';
import { User } from 'src/user/user.schema';
import { OpenGame } from '../types';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);
  private readonly gameConfig = config.get('game');
  private readonly redis: Redis;

  constructor(
    private gameRepository: GameRepository,
    private userRepository: UserRepository,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getClient();
  }

  async create(userId: Types.ObjectId): Promise<Game> {
    try {
      const user = await this.userRepository.findOne(
        {
          _id: userId,
        },
        false,
      );
      if (!user) {
        throw new NotFoundException('user not found');
      }
      const game = await this.gameRepository.create(user);
      this.setGameJoinTimeOut(game._id);
      delete game?.user1?.password;

      const stringData = JSON.stringify({
        _id: game._id,
        username: game.user1.username,
        score: game.user1.score,
      });

      this.redis.set(
        `open-game-${game._id}`,
        stringData,
        'EX',
        +this.gameConfig.joinTimeOut,
      );
      return game;
    } catch (error) {
      this.logger.error('error while creating new game', error);
      throw new UnauthorizedException();
    }
  }

  async getOpenGames(user: User): Promise<OpenGame[]> {
    try {
      const keys = await this.redis.keys('open-game-*');
      if (!keys || keys.length === 0) {
        return [];
      }
      const values = await this.redis.mget(...keys);
      const openGames: OpenGame[] = values.map((gameData) => {
        const data = JSON.parse(gameData);
        // do not return games that is created by this user
        if (data.username !== user.username) {
          return data;
        }
      });

      return openGames?.[0] ? openGames : [];
    } catch (error: any) {
      this.logger.error('error in getting open games', error);
      throw new UnauthorizedException();
    }
  }

  getUserGameHistory = async (user: User): Promise<Game[]> => {
    return this.gameRepository.find({
      $or: [{ user2: user._id }, { user1: user._id }],
      roundsCount: { $ne: 0 },
    });
  };

  async joinGame(
    user: User,
    gameId: string,
  ): Promise<{ gameId: Types.ObjectId }> {
    try {
      const game = await this.gameRepository.joinGame({ _id: gameId }, user);
      await this.redis.del(`open-game-${gameId}`);
      return { gameId: game._id };
    } catch (error: any) {
      this.logger.error('error in joining a game', error);
      throw new UnauthorizedException();
    }
  }

  setGameJoinTimeOut(gameId: Types.ObjectId) {
    try {
      setTimeout(async () => {
        const game = await this.gameRepository.findOne({ _id: gameId });
        if (game && !game.user2) {
          this.logger.log('### deleting game withid', gameId);
          await this.gameRepository.findOneAndDelete({ _id: gameId });
          this.redis.del(`open-game-${gameId}`);
        }
      }, this.gameConfig.joinTimeOut * 1000);
    } catch (error) {
      this.logger.error('### error while deleting a game after timeout', error);
    }
  }
}
