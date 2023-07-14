import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
export type Status = 'waiting' | 'playground';

export const Statuses: Status[] = ['waiting', 'playground'];

export class JoinDataDto {
  @IsEnum(Statuses)
  @IsNotEmpty()
  status: Status;

  @IsString()
  @IsNotEmpty()
  gameId: string;
}
