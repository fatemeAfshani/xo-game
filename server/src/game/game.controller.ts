import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Game } from './game.schema';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/user/user.decorator';
import { GameService } from './game.service';
import { User } from 'src/user/user.schema';
import { OpenGame } from '../types';
import { Types } from 'mongoose';

@Controller('games')
@UseGuards(AuthGuard())
export class GameController {
  constructor(private gameService: GameService) {}
  @Post('')
  async create(@GetUser() user: User): Promise<Game> {
    console.log('user', user);
    return this.gameService.create(user._id);
  }

  @Get('/open')
  async getOpenGames(@GetUser() user: User): Promise<OpenGame[]> {
    console.log('user', user);
    return this.gameService.getOpenGames(user);
  }

  @Get('/join/:id')
  async joinGame(
    @GetUser() user: User,
    @Param('id') id: string,
  ): Promise<{ gameId: Types.ObjectId }> {
    console.log('user', user);
    return this.gameService.joinGame(user, id);
  }

  @Get('/history')
  async getUserGameHistory(@GetUser() user: User): Promise<Game[]> {
    console.log('user', user);
    return this.gameService.getUserGameHistory(user);
  }
}
