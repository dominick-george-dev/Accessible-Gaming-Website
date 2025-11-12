import { Test, TestingModule } from '@nestjs/testing';
import { AccessibilityTagsService } from './accessibility-tags.service';
import { DatabaseService } from '../database/database.service';

describe('AccessibilityTagsService', () => {
  let service: AccessibilityTagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessibilityTagsService, {
        provide: DatabaseService,
        useValue: {},
      }],
    }).compile();

    service = module.get<AccessibilityTagsService>(AccessibilityTagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
