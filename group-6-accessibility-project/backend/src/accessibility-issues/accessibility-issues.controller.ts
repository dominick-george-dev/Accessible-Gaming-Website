import { Controller, Post, Body, UseGuards, Get, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { AccessibilityIssuesService } from './accessibility_issues.service';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';

@Controller('/accessibility-issues')
export class AccessibilityIssuesController {
  constructor(private readonly accessibilityIssuesService: AccessibilityIssuesService) {}

  @Post()
  async create(@Body() body: { userId: number; message: string }) {
    console.log('Received accessibility issue:', body);
    return this.accessibilityIssuesService.handleReportIssue(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll() {
    return this.accessibilityIssuesService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async resolve(@Param('id', ParseIntPipe) id: number) {
    return this.accessibilityIssuesService.resolveIssue(id);
  }
}