import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { DatabaseService } from '../database/database.service';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let databaseService: DatabaseService;
  let time = new Date();

  beforeEach(async () => {
    const mockDatabaseService = {
      review: {
        create: jest.fn().mockImplementation(({ data }) => ({
          id: 1,
          helpful: 0,
          createdAt: time,
          updatedAt: time,
          ...data,
        })),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewsService, {
        provide: DatabaseService,
        useValue: mockDatabaseService
      }],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

   it('should create a review', async () => {
    
    const createReviewDto = {
      userId: 1,
      userName: 'testuser',
      rating: 5,
      comment: 'Great game!',
      accessibilityFeedback: ['Easy to Read', 'Colorblind Friendly'],
      createdAt: time,
      updatedAt: time,
      game: { connect: { id: 1 } },
      User: {}, // Add User property to match ReviewCreateInput
    };

    // Call the service method
    const result = await service.create(createReviewDto);

    // Verify it called Prisma correctly
    expect(databaseService.review.create).toHaveBeenCalledWith({
      data: createReviewDto
    });

    // Verify the return value
    expect(result).toEqual({
      id: 1,
      helpful: 0,
      ...createReviewDto,
    });
  });

  it('should fetch all reviews', async () => {
    const reviews = [
      { id: 1, userId: 1, userName: 'user1', rating: 4, comment: 'Good game', accessibilityFeedback: ['Easy to Read'], helpful: 2, createdAt: time, updatedAt: time },
      { id: 2, userId: 2, userName: 'user2', rating: 5, comment: 'Excellent!', accessibilityFeedback: ['Colorblind Friendly'], helpful: 3, createdAt: time, updatedAt: time },
    ];

    (databaseService.review.findMany as jest.Mock).mockResolvedValue(reviews);

    const result = await service.findAll();

    expect(databaseService.review.findMany).toHaveBeenCalledWith();
    expect(result).toEqual(reviews);
  });

  it('should fetch all reviews for a specific game', async () => {
    const reviews = [
      { id: 1, gameId: 1, userId: 1, userName: 'user1', rating: 4, comment: 'Good game', accessibilityFeedback: ['Easy to Read'], helpful: 2, createdAt: time, updatedAt: time },
      { id: 2, gameId: 1, userId: 2, userName: 'user2', rating: 5, comment: 'Excellent!', accessibilityFeedback: ['Colorblind Friendly'], helpful: 3, createdAt: time, updatedAt: time },
    ];
    (databaseService.review.findMany as jest.Mock).mockResolvedValue(reviews);
    const result = await service.findAllByGameId(1);
    expect(databaseService.review.findMany).toHaveBeenCalledWith({ where: { gameId: 1 } });
    expect(result).toEqual(reviews);
  });

  it('should fetch a single review by id', async () => {
    const review = { id: 1, gameId: 1, userId: 1, userName: 'user1', rating: 4, comment: 'Good game', accessibilityFeedback: ['Easy to Read'], helpful: 2, createdAt: time, updatedAt: time };
    (databaseService.review.findUnique as jest.Mock).mockResolvedValue(review);
    const result = await service.findOne(1);
    expect(databaseService.review.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toEqual(review);
  });

  it('should update a review by id', async () => {
    const updateDto = { comment: 'Updated comment', rating: 5 };
    const updatedReview = { id: 1, gameId: 1, userId: 1, userName: 'user1', rating: 5, comment: 'Updated comment', accessibilityFeedback: ['Easy to Read'], helpful: 2, createdAt: time, updatedAt: time };
    (databaseService.review.update as jest.Mock).mockResolvedValue(updatedReview);
    const result = await service.update(1, updateDto);
    expect(databaseService.review.update).toHaveBeenCalledWith({ where: { id: 1 }, data: updateDto });
    expect(result).toEqual(updatedReview);
  });

  it('should delete a review by id', async () => {
    const deletedReview = { id: 1, gameId: 1, userId: 1, userName: 'user1', rating: 4, comment: 'Good game', accessibilityFeedback: ['Easy to Read'], helpful: 2, createdAt: time, updatedAt: time };
    (databaseService.review.delete as jest.Mock).mockResolvedValue(deletedReview);
    const result = await service.remove(1);
    expect(databaseService.review.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toEqual(deletedReview);
  });

});
