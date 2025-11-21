import { IsInt, Min } from 'class-validator';

export class GameIdParamDto {
  @IsInt()
  @Min(1)
  id: number;
}

