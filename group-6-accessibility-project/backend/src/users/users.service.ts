import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService) {}

  async createUser(data: Prisma.UserCreateInput) {
    return await this.database.user.create({
      data,
    });
  }

  async findUserById(id: number) {
    return await this.database.user.findUnique({
      where: { id },
      include: {
        accessibilitySettings: true,
        reviews: true,
      },
    });
  }

  async findAllUsers() {
    return await this.database.user.findMany({
      include: {
        accessibilitySettings: true,
      },
    });
  }
}
