import { Test, TestingModule } from '@nestjs/testing';
import { AccessibilityTagsService } from './accessibility-tags.service';

describe('AccessibilityTagsService', () => {
  let service: AccessibilityTagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessibilityTagsService],
    }).compile();

    service = module.get<AccessibilityTagsService>(AccessibilityTagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
