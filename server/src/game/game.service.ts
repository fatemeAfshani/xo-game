import * as config from 'config';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
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
    this.logger.debug('####', this.gameConfig);
    try {
      console.log('#### userId', userId);
      const user = await this.userRepository.findOne(
        {
          _id: userId,
        },
        false,
      );
      console.log('@@@@ user', user);
      if (!user) {
        throw new NotFoundException('user not found');
      }
      const game = await this.gameRepository.create(user);
      this.setGameJoinTimeOut(game._id);
      console.log('### game', game);
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
      const gamedata = await this.redis.get(`open-game-${game._id}`);
      console.log('#### check if game data is saved in redis', gamedata);
      return game;
    } catch (error) {
      this.logger.error('error while creating new game', error);
      throw new UnauthorizedException();
    }
  }

  async getOpenGames(user: User): Promise<OpenGame[]> {
    try {
      const keys = await this.redis.keys('open-game-*');
      console.log('##### newCursor, keys', keys);
      if (!keys || keys.length === 0) {
        return [];
      }
      const values = await this.redis.mget(...keys);
      console.log('#### values', values);
      const openGames: OpenGame[] = values.map((gameData) => {
        const data = JSON.parse(gameData);
        console.log('#### data', data, data[1], user.username);
        // do not return games that is created by this user
        if (data.username !== user.username) {
          return data;
        }
      });

      console.log('#### openGames', openGames, openGames[0]);

      return openGames?.[0] ? openGames : [];
    } catch (error: any) {
      this.logger.error('error in getting open games', error);
      throw new UnauthorizedException();
    }
  }

  getUserGameHistory = async (user: User): Promise<Game[]> => {
    const games = await this.gameRepository.find({
      $or: [{ user2: user._id }, { user1: user._id }],
      roundsCount: { $ne: 0 },
    });

    console.log('#### games', games);
    return games;
  };

  async joinGame(
    user: User,
    gameId: string,
  ): Promise<{ gameId: Types.ObjectId }> {
    try {
      this.logger.debug('#### user trying to join game service', user);
      const game = await this.gameRepository.joinGame({ _id: gameId }, user);
      await this.redis.del(`open-game-${gameId}`);
      this.logger.debug('@@@@ before returning data');
      return { gameId: game._id };
    } catch (error: any) {
      this.logger.error('error in joining a game', error);
      throw new UnauthorizedException();
    }
  }

  setGameJoinTimeOut(gameId: Types.ObjectId) {
    try {
      console.log('##### game config', this.gameConfig);
      setTimeout(async () => {
        const game = await this.gameRepository.findOne({ _id: gameId });
        if (game && !game.user2) {
          console.log('### deleting game withid', gameId);
          await this.gameRepository.findOneAndDelete({ _id: gameId });
          this.redis.del(`open-game-${gameId}`);
        }
      }, this.gameConfig.joinTimeOut * 1000);
    } catch (error) {
      this.logger.error('### error while deleting a game after timeout', error);
    }
  }
}
