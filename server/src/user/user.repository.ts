import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, UpdateQuery, SaveOptions } from 'mongoose';
import { UserGameFinish } from 'src/types';
import { UserCredentialsDto } from './dto/UserCredentials.dto';

import { User } from './user.schema';

@Injectable()
export class UserRepository {
  protected readonly logger = new Logger(UserRepository.name);

  constructor(
    @InjectModel(User.name) protected readonly userModel: Model<User>, // @InjectConnection() private readonly connection: Connection,
  ) {}

  async create(user: UserCredentialsDto, options?: SaveOptions): Promise<User> {
    const createdUser = new this.userModel({
      ...user,
      _id: new Types.ObjectId(),
    });
    return (await createdUser.save(options)).toJSON() as unknown as User;
  }

  async findOne(
    filterQuery: FilterQuery<User>,
    returnError = true,
  ): Promise<User | null> {
    const user = await this.userModel.findOne(filterQuery, {}, { lean: true });
    if (!user) {
      this.logger.warn('User not found with filterQuery', filterQuery);
      if (returnError) {
        throw new NotFoundException('user not found.');
      } else {
        return null;
      }
    }

    return user;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<User>,
    update: UpdateQuery<User>,
  ) {
    const user = await this.userModel.findOneAndUpdate(filterQuery, update, {
      lean: true,
      new: true,
    });

    if (!user) {
      this.logger.warn(`User not found with filterQuery:`, filterQuery);
      throw new NotFoundException('user not found.');
    }

    return user;
  }

  async upsert(filterQuery: FilterQuery<User>, document: Partial<User>) {
    return this.userModel.findOneAndUpdate(filterQuery, document, {
      lean: true,
      upsert: true,
      new: true,
    });
  }

  async find(filterQuery: FilterQuery<User>) {
    return this.userModel.find(filterQuery, {}, { lean: true });
  }

  async finishGame(filterQuery: FilterQuery<User>, data: UserGameFinish) {
    const user = await this.userModel.findOne(filterQuery);

    user.score += data.increaseScore;
    if (data.isDraw) user.drawCount += 1;
    if (data.winner === user._id.toString()) {
      this.logger.debug('#### user1 winner');
      user.winCount += 1;
    } else {
      user.lossCount += 1;
    }

    await user.save();
    return user;
  }
}
