import { Test, TestingModule } from '@nestjs/testing';
import { AccessibilityTagsController } from './accessibility-tags.controller';
import { AccessibilityTagsService } from './accessibility-tags.service';

describe('AccessibilityTagsController', () => {
  let controller: AccessibilityTagsController;
  let service: AccessibilityTagsService;
  let time = new Date();

  beforeEach(async () => {
    const mockAccessibilityTagsService = {
      findAll: jest.fn().mockResolvedValue([{
        id: 1,
        tag: 'Easy to Read',
        category: 'Text',
        updatedAt: time,
        createdAt: time,
      }]),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccessibilityTagsController],
      providers: [
        {
          provide: AccessibilityTagsService,
          useValue: mockAccessibilityTagsService,
        },
      ],
    }).compile();

    controller = module.get<AccessibilityTagsController>(AccessibilityTagsController);
    service = module.get<AccessibilityTagsService>(AccessibilityTagsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all accessibility tags', async () => {
    const mockTags = [
      { id: 1, tag: 'Easy to Read', category: 'Text', updatedAt: time, createdAt: time },
      { id: 2, tag: 'Colorblind Friendly', category: 'Visual', updatedAt: time, createdAt: time },
    ];
    (service.findAll as jest.Mock).mockResolvedValue(mockTags);
    const result = await controller.findAll();

    expect(result).toEqual(mockTags);
  });

});
