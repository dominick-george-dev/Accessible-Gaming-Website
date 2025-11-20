import { IsInt, Min } from "class-validator";

export class GameAnalyticsDto {
    @IsInt()
    @Min(1)
    gameId: number;
}