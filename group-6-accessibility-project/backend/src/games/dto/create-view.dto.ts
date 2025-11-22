import { IsOptional } from "class-validator";

export class CreateViewDto {

    @IsOptional()
    viewedAt: Date;
}