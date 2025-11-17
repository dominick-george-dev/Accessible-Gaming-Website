
import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';

export class CreateUserDto {
  email: string;
  username: string;
  password: string;  // Added required password field
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  async findAllUsers() {
    return this.usersService.findAllUsers();
  }

  @Get(':id')
  async findUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findUserById(id);
  }
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
