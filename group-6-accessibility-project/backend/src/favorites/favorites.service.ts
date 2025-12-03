import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async toggleFavorite(userId: number, gameId: number) {
  try {
    const existing = await this.databaseService.favourites.findFirst({ 
      where: { userId, gameId } 
    });

    if (existing) {
      // Use deleteMany instead of delete to avoid P2025 error
      await this.databaseService.favourites.deleteMany({ 
        where: { userId, gameId } // Delete by userId + gameId instead of id
      });
      return { removed: true, gameId };
    }

    await this.databaseService.favourites.create({ 
      data: { userId, gameId } 
    });
    return { added: true, gameId };
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw new InternalServerErrorException('Failed to toggle favorite');
  }
}

  async getFavorites(userId: number) {
    try {
      return await this.databaseService.favourites.findMany({ 
        where: { userId }
      });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw new InternalServerErrorException('Failed to fetch favorites');
    }
  }
}