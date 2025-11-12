import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';


@Injectable()
export class AccessibilityTagsService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Create a new accessibility tag
  async create(createAccessibilityTagDto: Prisma.AccessibilityTagsCreateInput) {
    return this.databaseService.accessibilityTags.create({
      data: createAccessibilityTagDto,
    });
  }

  // Get all accessibility tags
  async findAll() {
    return this.databaseService.accessibilityTags.findMany();
  }
  
  // Get all accessibility tags for a specific game
  async findAllByGameId(gameId: number) {
  // Get all tag IDs related to this game
  const tagLinks = await this.databaseService.gameAccessibilityTags.findMany({
    where: { gameId },
    select: { accessibilityTagsId: true },
  });

  const tagIds = tagLinks.map(tag => tag.accessibilityTagsId);

  // Fetch all tags with those IDs
  return this.databaseService.accessibilityTags.findMany({
    where: { id: { in: tagIds } },
  });
}

  // Get a specific accessibility tag by ID
  async findOne(id: number) {
    return this.databaseService.accessibilityTags.findUnique({
      where: { id },
    });
  }

  // Update an accessibility tag by ID
  async update(id: number, updateAccessibilityTagDto: Prisma.AccessibilityTagsUpdateInput) {
    return this.databaseService.accessibilityTags.update({
      where: { id },
      data: updateAccessibilityTagDto,
    });
  }

  // Delete an accessibility tag by ID
  async remove(id: number) {
    return this.databaseService.accessibilityTags.delete({
      where: { id },
    });
  }
}
