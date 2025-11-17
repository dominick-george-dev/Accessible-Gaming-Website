import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { AccessibilityTagsService } from './accessibility-tags.service';
import { Prisma } from '@prisma/client';


@Controller('accessibility-tags')
export class AccessibilityTagsController {
  constructor(private readonly accessibilityTagsService: AccessibilityTagsService) {}

  // Create a new accessibility tag
  @Post()
  create(@Body() createAccessibilityTagDto: Prisma.AccessibilityTagsCreateInput) {
    return this.accessibilityTagsService.create(createAccessibilityTagDto);
  }
  // Get all accessibility tags
  @Get()
  findAll() {
    return this.accessibilityTagsService.findAll();
  }
  // Get all accessibility tags for a specific game
  @Get('game/:gameId')
  findAllByGameId(@Param('gameId', ParseIntPipe) gameId: number) {
    return this.accessibilityTagsService.findAllByGameId(gameId);
  }
  // Get a specific accessibility tag by ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accessibilityTagsService.findOne(+id);
  }
  // Update an accessibility tag by ID
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccessibilityTagDto: Prisma.AccessibilityTagsUpdateInput) {
    return this.accessibilityTagsService.update(+id, updateAccessibilityTagDto);
  }
  // Delete an accessibility tag by ID
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accessibilityTagsService.remove(+id);
  }
}
