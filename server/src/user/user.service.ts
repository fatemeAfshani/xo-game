import * as bcrypt from 'bcrypt';

import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserCredentialsDto } from './dto/UserCredentials.dto';
import { UserRepository } from './user.repository';
import { User } from './user.schema';
import { Payload } from './auth/jwt-payload.type';
import { Types } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async signup(
    userData: UserCredentialsDto,
  ): Promise<{ accessToken: string; userId: Types.ObjectId }> {
    let user: User;
    user = await this.userRepository.findOne(
      {
        username: userData.username,
      },
      false,
    );
    if (user) {
      throw new UnprocessableEntityException('Username already exists.');
    }
    user = await this.userRepository.create({
      ...userData,
      password: await bcrypt.hash(userData.password, 10),
    });
    const payload: Payload = { username: user.username, _id: user._id };
    return {
      userId: user._id,
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async signin({ username, password }: UserCredentialsDto): Promise<{
    accessToken: string;
    userId: Types.ObjectId;
  }> {
    const user = await this.userRepository.findOne(
      {
        username,
      },
      false,
    );
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('invalid login');
    }

    const payload: Payload = { username: user.username, _id: user._id };
    return {
      userId: user._id,
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async getUser(userId: Types.ObjectId): Promise<User> {
    const user = await this.userRepository.findOne({ _id: userId });
    delete user.password;

    return user;
  }
}
