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

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async signup(userData: UserCredentialsDto): Promise<Omit<User, 'password'>> {
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
    delete user.password;
    return user;
  }

  async signin({
    username,
    password,
  }: UserCredentialsDto): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findOne(
      {
        username,
      },
      false,
    );
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('invalid login');
    }

    const payload: Payload = { username: user.username };
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
