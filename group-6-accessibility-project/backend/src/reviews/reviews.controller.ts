import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Prisma } from '@prisma/client';


@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Create a new review
  @Post()
  create(@Body() createReviewDto: Prisma.ReviewCreateInput) {
    return this.reviewsService.create(createReviewDto);
  }

  // Get all reviews
  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  // Get all reviews for a specific game
  @Get('game/:gameId')
  findAllByGameId(@Param('gameId') gameId: string) {
    return this.reviewsService.findAllByGameId(+gameId);
  }
  // Get a single review by ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(+id);
  }
  // Update a review by ID
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: Prisma.ReviewUpdateInput) {
    return this.reviewsService.update(+id, updateReviewDto);
  }
  // Delete a review by ID
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(+id);
  }
}
