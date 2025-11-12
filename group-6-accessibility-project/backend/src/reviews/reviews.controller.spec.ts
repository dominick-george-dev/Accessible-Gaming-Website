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
});