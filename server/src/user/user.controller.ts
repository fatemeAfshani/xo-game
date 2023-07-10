import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UserCredentialsDto } from './dto/UserCredentials.dto';
import { User } from './user.schema';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Post('/signup')
  async signup(
    @Body() createUserData: UserCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.userService.signup(createUserData);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/signin')
  async signin(
    @Body() UserCredential: UserCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.userService.signin(UserCredential);
  }
}
