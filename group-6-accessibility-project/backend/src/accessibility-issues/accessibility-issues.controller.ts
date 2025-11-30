import { Controller, Post, Body } from '@nestjs/common';
import { AccessibilityIssuesService } from './accessibility_issues.service';

@Controller('accessibility-issues')
export class AccessibilityIssuesController {
  constructor(private readonly accessibilityIssuesService: AccessibilityIssuesService) {}

  @Post()
  async create(@Body() body: { userId: number; message: string }) {
    console.log('Received accessibility issue:', body);
    return this.accessibilityIssuesService.handleReportIssue(body);
  }
}