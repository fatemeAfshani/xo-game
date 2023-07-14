import * as config from 'config';

import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@liaoliaots/nestjs-redis';

const { uri: mongoUri } = config.get('mongo');
const { url: redisUrl } = config.get('redis');
console.log('#### redis url', redisUrl);

@Module({
  imports: [
    MongooseModule.forRoot(mongoUri),
    RedisModule.forRoot({
      config: {
        url: redisUrl,
      },
    }),
    UserModule,
    GameModule,
  ],
})
export class AppModule {}
