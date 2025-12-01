import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { AccessibilityTagsService } from './accessibility-tags.service';
import { Prisma } from '@prisma/client';

@Controller('accessibility-tags')
export class AccessibilityTagsController {
  constructor(private readonly accessibilityTagsService: AccessibilityTagsService) { }

  //Admin only access for creating a new accessibility tag
  @Post()
  @UseGuards(ThrottlerGuard, JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createAccessibilityTagDto: { tag: string; category: string }) {
    return this.accessibilityTagsService.create(createAccessibilityTagDto);
  }

  //Public get all accessibility tags
  @Get()
  findAll() {
    return this.accessibilityTagsService.findAll();
  }

  // Public get all accessibility tags for a specific game
  @Get('game/:gameId')
  findAllByGameId(@Param('gameId', ParseIntPipe) gameId: number) {
    return this.accessibilityTagsService.findAllByGameId(gameId);
  }

  // Public get a specific accessibility tag by ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accessibilityTagsService.findOne(+id);
  }

  // Admin only access for updating an accessibility tag by ID
  @Patch(':id')
  @UseGuards(ThrottlerGuard, JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateAccessibilityTagDto: { tag?: string; category?: string }) {
    return this.accessibilityTagsService.update(+id, updateAccessibilityTagDto);
  }

  //Admin only access for delete accessibility tag by ID
  @Delete(':id')
  @UseGuards(ThrottlerGuard, JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.accessibilityTagsService.remove(+id);
  }
}