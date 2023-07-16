import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/user/user.module';
import { GameController } from './game.controller';
import { GameRepository } from './game.repository';
import { Game, GameSchema } from './game.schema';
import { GameService } from './game.service';
import { PlaygroundGateway } from './playground.gateway';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { GameProvider } from './game.provider';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
    UserModule,
    RedisModule,
  ],
  controllers: [GameController],
  providers: [GameRepository, GameService, PlaygroundGateway, GameProvider],
})
export class GameModule {}
