import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';
import { CreateViewDto } from './dto/create-view.dto';

@Injectable()
export class GamesService {

    constructor(private readonly databaseService: DatabaseService) {}

    // Sample method to find all games
    async findById(id: number) {
        return this.databaseService.game.findUnique({
            where: {
                id,
            }
        });
    }
    async createView(id: number, dto: CreateViewDto) {
        return this.databaseService.view.create({
            data:{
                viewedAt: dto.viewedAt,
                game: {
                    connect: {id: id}
                },
            }
        });
    }
}

