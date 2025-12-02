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

  async findAll() {
    return this.databaseService.accessibilityIssues.findMany({
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async resolveIssue(id: number) {
    return this.databaseService.accessibilityIssues.delete({
      where: { id },
    });
  }
}