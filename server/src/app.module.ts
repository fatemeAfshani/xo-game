import * as config from 'config';

import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { MongooseModule } from '@nestjs/mongoose';

const { uri } = config.get('mongo');

@Module({
  imports: [MongooseModule.forRoot(uri), UserModule, GameModule],
})
export class AppModule {}
