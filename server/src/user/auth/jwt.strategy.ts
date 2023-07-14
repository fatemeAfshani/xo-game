import * as config from 'config';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { Payload } from './jwt-payload.type';
import { UserRepository } from 'src/user/user.repository';
import { User } from 'src/user/user.schema';
import { Payload } from './jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userRepository: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('jwt.secret'),
    });
  }

  async validate(payload: Payload): Promise<User> {
    const user = await this.userRepository.findOne({ _id: payload._id }, false);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
