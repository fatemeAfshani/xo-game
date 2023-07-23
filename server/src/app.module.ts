import * as config from 'config';

import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@liaoliaots/nestjs-redis';
// import { ServeStaticModule } from '@nestjs/serve-static';
// import { join } from 'path';

const { uri: mongoUri } = config.get('mongo');
const { url: redisUrl } = config.get('redis');

@Module({
  imports: [
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '../../client/dist'),
    // }),
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
