import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';

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
    async findAll(){
        return this.databaseService.game.findMany()
        }
}

