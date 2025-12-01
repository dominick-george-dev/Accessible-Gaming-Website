import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class FavoritesService {
  async toggleFavorite(userId: number, gameId: number) {
    try {
      const existing = await prisma.favourites.findFirst({ where: { userId, gameId } });

      if (existing) {
        await prisma.favourites.delete({ where: { id: existing.id } });
        return { removed: true, gameId };
      }

      await prisma.favourites.create({ data: { userId, gameId } });
      return { added: true, gameId };
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw new InternalServerErrorException('Failed to toggle favorite');
    }
  }

  async getFavorites(userId: number) {
    try {
      return await prisma.favourites.findMany({ where: { userId } });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw new InternalServerErrorException('Failed to fetch favorites');
    }
  }
}
