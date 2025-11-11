import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';


@Injectable()
export class ReviewsService {


  constructor(private readonly databaseService: DatabaseService) {}

  create(createReviewDto: Prisma.ReviewCreateInput) {
    return this.databaseService.review.create({ data: createReviewDto });
  }

  findAll() {
    return this.databaseService.review.findMany();
  }

  findAllByGameId(gameId: number) {
    return this.databaseService.review.findMany({ where: { gameId } });
  }

  findOne(id: number) {
    return this.databaseService.review.findUnique({ where: { id } });
  }

  update(id: number, updateReviewDto: Prisma.ReviewUpdateInput) {
    return this.databaseService.review.update({ where: { id }, data: updateReviewDto });
  }

  remove(id: number) {
    return this.databaseService.review.delete({ where: { id } });
  }
}
