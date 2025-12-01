import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PublishersService } from './publishers.service';

interface CreatePublisherDto {
  userId: number;
  displayName: string;
}

@Controller('publishers')
export class PublishersController {
  constructor(private readonly publishersService: PublishersService) {}

  @Post()
  async create(@Body() createPublisherDto: CreatePublisherDto) {
    return this.publishersService.create(createPublisherDto);
  }

  @Get()
  async findAll() {
    return this.publishersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.publishersService.findOne(+id);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return this.publishersService.findByUserId(+userId);
  }
}