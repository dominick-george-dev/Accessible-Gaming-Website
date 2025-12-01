import { IsInt, IsString, IsArray, IsOptional, Min, Max } from 'class-validator';

export class CreateReviewDto {

  @IsInt()
  gameId: number;

  @IsInt()
  userId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  comment: string;

  @IsArray()
  @IsString({ each: true })
  accessibilityFeedback: string[];

  @IsOptional()
  @IsInt()
  helpful?: number;

  @IsString()
  userName: string;
}

export class UpdateReviewDto {
  @IsOptional()
  @IsInt()
  gameId?: number;

  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accessibilityFeedback?: string[];

  @IsOptional()
  @IsInt()
  helpful?: number;

  @IsOptional()
  @IsString()
  userName?: string;
}
