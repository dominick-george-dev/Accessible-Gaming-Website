// favorites/favorites.controller.ts
import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get(':userId')
  getFavorites(@Param('userId') userId: string) {
    return this.favoritesService.getFavorites(Number(userId));
  }

  @Post('toggle')
  toggleFavorite(@Body() body: { userId: number; gameId: number }) {
    return this.favoritesService.toggleFavorite(body.userId, body.gameId);
  }
}
