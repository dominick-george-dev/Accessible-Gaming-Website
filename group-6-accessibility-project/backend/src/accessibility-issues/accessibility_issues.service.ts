import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AccessibilityIssuesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async handleReportIssue(data: { userId: number; message: string }) {
    console.log('Submitted!')
    return this.databaseService.accessibilityIssues.create({
      data: {
        userId: data.userId,
        message: data.message,
      },
    });
  }
}