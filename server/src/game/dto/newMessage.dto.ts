import { IsNotEmpty, IsString } from 'class-validator';

export class NewMessageDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  gameId: string;
}
