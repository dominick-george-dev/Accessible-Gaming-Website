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
    try {
      const rows = await this.databaseService.accessibilityIssues.findMany({
        include: { user: true },
        orderBy: { createdAt: 'asc' },
      });

      return rows;
    } catch (err) {
      console.error('findAll error:', err);
      
      return this.databaseService.accessibilityIssues.findMany({
        orderBy: { createdAt: 'asc' },
      });
    }
  }

  async resolveIssue(id: number) {
    return this.databaseService.accessibilityIssues.delete({
      where: { id },
    });
  }
}