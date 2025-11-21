import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {

    constructor(private readonly databaseService: DatabaseService) {}

    async findUserByEmail(email: string) {
        try {
            console.log('Database service:', this.databaseService);
            console.log('Searching for email:', email);
            
            const user = await this.databaseService.user.findUnique({
                where: { email },
            });
            
            return user;
        } catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    }
}
