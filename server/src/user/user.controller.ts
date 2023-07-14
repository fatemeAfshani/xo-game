import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Types } from 'mongoose';
import { UserCredentialsDto } from './dto/UserCredentials.dto';
import { GetUser } from './user.decorator';
import { User } from './user.schema';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Post('/signup')
  async signup(
    @Body() createUserData: UserCredentialsDto,
  ): Promise<{ accessToken: string; userId: Types.ObjectId }> {
    return this.userService.signup(createUserData);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/signin')
  async signin(
    @Body() UserCredential: UserCredentialsDto,
  ): Promise<{ accessToken: string; userId: Types.ObjectId }> {
    return this.userService.signin(UserCredential);
  }

  @Get('/me')
  @UseGuards(AuthGuard())
  async getUser(@GetUser() user: User): Promise<User> {
    console.log('#### user', user);
    return this.userService.getUser(user._id);
  }
}
