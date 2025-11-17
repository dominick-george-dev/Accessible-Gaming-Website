import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('/email/:findEmail')
    async findUserByEmail(@Param('findEmail') email: string) {
        try {
            console.log('Looking for user with email:', email);
            const user = await this.usersService.findUserByEmail(email);
            console.log('User found:', user);
            return user;
        } catch (error) {
            console.error('Error finding user:', error);
            throw error;
        }
    }
}
