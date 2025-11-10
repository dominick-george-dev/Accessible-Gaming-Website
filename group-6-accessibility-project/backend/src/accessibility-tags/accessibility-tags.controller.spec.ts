import { Test, TestingModule } from '@nestjs/testing';
import { AccessibilityTagsController } from './accessibility-tags.controller';
import { AccessibilityTagsService } from './accessibility-tags.service';

describe('AccessibilityTagsController', () => {
  let controller: AccessibilityTagsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccessibilityTagsController],
      providers: [AccessibilityTagsService],
    }).compile();

    controller = module.get<AccessibilityTagsController>(AccessibilityTagsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
