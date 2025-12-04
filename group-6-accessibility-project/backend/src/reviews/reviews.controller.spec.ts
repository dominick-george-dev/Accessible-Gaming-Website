import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let service: ReviewsService;
  let time = new Date();

  beforeEach(async () => {
    const mockReviewsService = {
      create: jest.fn().mockResolvedValue([{
        id: 1,
        userId: 1,
        userName: 'testuser',
        rating: 5,
        comment: 'Great game!',
        accessibilityFeedback: ['Easy to Read', 'Colorblind Friendly'],
        helpful: 0,
        createdAt: time,
        updatedAt: time,
        game: { connect: { id: 1 } },
      }]),
      findAll: jest.fn().mockResolvedValue([{ id: 1, userName: 'testuser', comment: 'Great game!', rating: 5 }]),
      findAllByGameId: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [ {
        provide: ReviewsService,
        useValue: mockReviewsService,
      }],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
    service = module.get<ReviewsService>(ReviewsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should fetch all reviews', async () => {
    const mockReview = [{ id: 1, userName: 'testuser', comment: 'Great game!', rating: 5 }];
    expect(controller.findAll()).toBeDefined();
    await expect(controller.findAll()).resolves.toEqual(mockReview);
  });

  it('should call ReviewsService.findAll', async () => {
    const reviewsService = await controller['reviewsService'];
    const findAllSpy = jest.spyOn(reviewsService, 'findAll');
    await controller.findAll();
    expect(findAllSpy).toHaveBeenCalled();
  });
  
  it('should return empty array when no reviews', async () => {
    const reviewsService = await controller['reviewsService'];
    jest.spyOn(reviewsService, 'findAll').mockResolvedValueOnce([]);
    await expect(controller.findAll()).resolves.toEqual([]);
  });

  it('should create a review', async () => {
    const createReviewDto = {
      userId: 1,
      User: {},
      userName: 'testuser',
      rating: 5,
      comment: 'Great game!',
      accessibilityFeedback: ['Easy to Read', 'Colorblind Friendly'],
      game: { connect: { id: 1 } },
    };
    const result = await controller.create(createReviewDto);
    expect(service.create).toHaveBeenCalledWith(createReviewDto);
    expect(result).toEqual([{
      id: 1,
      userId: 1,
      userName: 'testuser',
      rating: 5,
      comment: 'Great game!',
      helpful: 0,
      createdAt: time,
      updatedAt: time,
      accessibilityFeedback: ['Easy to Read', 'Colorblind Friendly'],
      game: { connect: { id: 1 } },
    }]);
  });

  it('should fetch all reviews for a specific game', async () => {
    const reviewsService = controller['reviewsService'];
    const mockReviews = [{
      id: 1,
      gameId: 1,
      userId: 1,
      rating: 5,
      comment: 'Great game!',
      createdAt: time,
      updatedAt: time,
      accessibilityFeedback: ['Easy to Read', 'Colorblind Friendly'],
      helpful: 0,
      userName: 'testuser',
    }];
    jest.spyOn(reviewsService, 'findAllByGameId').mockResolvedValueOnce(mockReviews);
    await expect(controller.findAllByGameId('1')).resolves.toEqual(mockReviews);
    expect(reviewsService.findAllByGameId).toHaveBeenCalledWith(1);
  });

  it('should fetch a single review by id', async () => {
    const reviewsService = controller['reviewsService'];
    const mockReview = {
      id: 1,
      gameId: 1,
      userId: 1,
      rating: 5,
      comment: 'Great game!',
      createdAt: time,
      updatedAt: time,
      accessibilityFeedback: ['Easy to Read', 'Colorblind Friendly'],
      helpful: 0,
      userName: 'testuser',
    };
    jest.spyOn(reviewsService, 'findOne').mockResolvedValueOnce(mockReview);
    await expect(controller.findOne('1')).resolves.toEqual(mockReview);
    expect(reviewsService.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a review by id', async () => {
    const reviewsService = controller['reviewsService'];
    const updateDto = { comment: 'Updated comment', rating: 4 };
    const updatedReview = {
      id: 1,
      gameId: 1,
      userId: 1,
      rating: 4,
      comment: 'Updated comment',
      createdAt: time,
      updatedAt: time,
      accessibilityFeedback: ['Easy to Read', 'Colorblind Friendly'],
      helpful: 0,
      userName: 'testuser',
    };
    jest.spyOn(reviewsService, 'update').mockResolvedValueOnce(updatedReview);
    await expect(controller.update('1', updateDto)).resolves.toEqual(updatedReview);
    expect(reviewsService.update).toHaveBeenCalledWith(1, updateDto);
  });

  it('should delete a review by id', async () => {
    const reviewsService = controller['reviewsService'];
    const deletedReview = {
      id: 1,
      gameId: 1,
      userId: 1,
      rating: 5,
      comment: 'Great game!',
      createdAt: time,
      updatedAt: time,
      accessibilityFeedback: ['Easy to Read', 'Colorblind Friendly'],
      helpful: 0,
      userName: 'testuser',
    };
    jest.spyOn(reviewsService, 'remove').mockResolvedValueOnce(deletedReview);
    await expect(controller.remove('1')).resolves.toEqual(deletedReview);
    expect(reviewsService.remove).toHaveBeenCalledWith(1);
  });
});