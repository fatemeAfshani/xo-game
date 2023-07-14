import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
export type Turn = 'X' | 'O';

export const Turns: Turn[] = ['X', 'O'];

export class UserMoveDto {
  @IsEnum(Turns)
  @IsNotEmpty()
  turn: Turn;

  @IsNumber()
  @IsNotEmpty()
  index: number;

  @IsString()
  @IsNotEmpty()
  gameId: string;
}
