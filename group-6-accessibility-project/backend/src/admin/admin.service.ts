import { Injectable, NotFoundException, BadRequestException, Optional } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';
import { AccessibilityTagsService } from '../accessibility-tags/accessibility-tags.service';

@Injectable()
export class AdminService {
    private readonly MAX_PAGE_SIZE = 100;
    private readonly DEFAULT_PAGE_SIZE = 20;

    constructor(
        private readonly databaseService: DatabaseService,
        @Optional() private readonly accessibilityTagsService?: AccessibilityTagsService
    ) { }

    async get() {
    }
}
