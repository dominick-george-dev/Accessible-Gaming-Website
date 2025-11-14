import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class GamesService {

    constructor(private readonly databaseService: DatabaseService) {}

    async findById(id: number) {
        return this.databaseService.game.findUnique({
            where: {
                id,
            }
        });
    }

    async findAll() {
        return this.databaseService.game.findMany();
    }
}

