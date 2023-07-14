import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, UpdateQuery, SaveOptions } from 'mongoose';
import { User } from 'src/user/user.schema';
import { Game } from './game.schema';

@Injectable()
export class GameRepository {
  protected readonly logger = new Logger(GameRepository.name);

  constructor(
    @InjectModel(Game.name) protected readonly gameModel: Model<Game>, // @InjectConnection() private readonly connection: Connection,
  ) {}

  async create(user: User, options?: SaveOptions): Promise<Game> {
    const createdGame = new this.gameModel({
      _id: new Types.ObjectId(),
      user1: user,
    });

    console.log('#### createdGame', createdGame);
    return (
      await (
        await createdGame.save(options)
      ).populate('user1', '_id username score')
    ).toJSON() as unknown as Game;
  }

  async findOne(
    filterQuery: FilterQuery<Game>,
    returnError = true,
  ): Promise<Game | null> {
    const game = await this.gameModel
      .findOne(filterQuery, {}, { lean: true })
      .populate('user1', '_id username score winCount lossCount drawCount')
      .populate('user2', '_id username score winCount lossCount drawCount');
    if (!game) {
      this.logger.warn('Game not found with filterQuery', filterQuery);
      if (returnError) {
        throw new NotFoundException('game not found.');
      } else {
        return null;
      }
    }

    return game;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<Game>,
    update: UpdateQuery<Game>,
  ) {
    const game = await this.gameModel.findOneAndUpdate(filterQuery, update, {
      lean: true,
      new: true,
    });

    if (!game) {
      this.logger.warn(`game not found with filterQuery:`, filterQuery);
      throw new NotFoundException('game not found.');
    }
    return game;
  }

  async joinGame(filterQuery: FilterQuery<Game>, user: User): Promise<Game> {
    const game = await this.gameModel.findOne(filterQuery);
    this.logger.debug('### before joining to game', game);

    if (!game) {
      this.logger.warn(`game not found with filterQuery:`, filterQuery);
      throw new NotFoundException('game not found.');
    }
    if (game.user2) throw new ConflictException('can not join to this game');

    game.user2 = user;
    await game.save();
    this.logger.debug('##### after joining to game', game);
    return game;
  }

  //   async upsert(filterQuery: FilterQuery<User>, document: Partial<User>) {
  //     return this.userModel.findOneAndUpdate(filterQuery, document, {
  //       lean: true,
  //       upsert: true,
  //       new: true,
  //     });
  //   }

  async find(filterQuery: FilterQuery<Game>) {
    return this.gameModel
      .find(filterQuery, {}, { lean: true })
      .populate('user1', '_id username score');
  }

  async findOneAndDelete(filterQuery: FilterQuery<Game>) {
    return this.gameModel.findOneAndDelete(filterQuery);
  }
}