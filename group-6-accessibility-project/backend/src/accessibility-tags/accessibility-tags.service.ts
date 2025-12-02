import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';


@Injectable()
export class AccessibilityTagsService {
  constructor(private readonly databaseService: DatabaseService) { }

  // Create a new accessibility tag
  async create(createAccessibilityTagDto: Prisma.AccessibilityTagsCreateInput) {
    const { id, ...tagData } = createAccessibilityTagDto as any;

    return this.databaseService.accessibilityTags.create({
      data: {
        tag: tagData.tag,
        category: tagData.category,
      },
    });
  }

  // Get all accessibility tags
  async findAll() {
    return this.databaseService.accessibilityTags.findMany();
  }

  // Get all accessibility tags for a specific game
  async findAllByGameId(gameId: number) {
    // Fetch join rows and include the related accessibility tag objects directly
    const tagLinks = await this.databaseService.gameAccessibilityTags.findMany({
      where: { gameId },
      include: { accessibilityTags: true },
    });

    if (!tagLinks || tagLinks.length === 0) return [];

    // Map to the included tag objects and filter any nulls
    return tagLinks.map((l) => l.accessibilityTags).filter(Boolean);
  }

  // Get a specific accessibility tag by ID
  async findOne(id: number) {
    return this.databaseService.accessibilityTags.findUnique({
      where: { id },
    });
  }

  // Update an accessibility tag by ID
  async update(id: number, updateAccessibilityTagDto: Prisma.AccessibilityTagsUpdateInput) {
    const { id: _, ...updateData } = updateAccessibilityTagDto as any;

    return this.databaseService.accessibilityTags.update({
      where: { id },
      data: {
        tag: updateData.tag,
        category: updateData.category,
      },
    });
  }

  // Delete an accessibility tag by ID
  async remove(id: number) {
    return this.databaseService.$transaction(async (tx) => {
      await tx.gameAccessibilityTags.deleteMany({
        where: { accessibilityTagsId: id },
      });

      return tx.accessibilityTags.delete({
        where: { id },
      });
    });
  }
}
