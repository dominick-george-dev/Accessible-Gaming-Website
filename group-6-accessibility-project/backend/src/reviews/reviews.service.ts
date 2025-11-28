import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';


@Injectable()
export class ReviewsService {


  constructor(private readonly databaseService: DatabaseService) {}

  // Create a new review
  create(createReviewDto: Prisma.ReviewCreateInput) {
    return this.databaseService.review.create({ data: createReviewDto });
  }

  // Get all reviews
  findAll() {
    return this.databaseService.review.findMany();
  }

  // Get all reviews for a specific game
  findAllByGameId(gameId: number) {
    return this.databaseService.review.findMany({ where: { gameId } });
  }

  // Get a single review by ID
  findOne(id: number) {
    return this.databaseService.review.findUnique({ where: { id } });
  }

  // Update a review by ID
  update(id: number, updateReviewDto: Prisma.ReviewUpdateInput) {
    return this.databaseService.review.update({ where: { id }, data: updateReviewDto });
  }

  // Delete a review by ID
  remove(id: number) {
    return this.databaseService.review.delete({ where: { id } });
  }
}
