import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PublishersService {
  constructor(private databaseService: DatabaseService) {}

  async create(createPublisherDto: { userId: number; displayName: string }) {
    const { userId, displayName } = createPublisherDto;

    // Validate input
    if (!displayName?.trim()) {
      throw new BadRequestException('Display name is required');
    }

    // Check if user exists
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, role: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already has a publisher account
    const existingPublisher = await this.databaseService.publisher.findFirst({
      where: { userId: userId }
    });

    if (existingPublisher) {
      throw new ConflictException('User already has a publisher account');
    }

    try {
      // Create publisher account and update user role in a transaction
      const result = await this.databaseService.$transaction(async (prisma) => {
        // Create publisher account
        const publisher = await prisma.publisher.create({
          data: {
            userId: userId,
            displayName: displayName.trim(),
            profilePicture: null, // Can be added later
          },
          include: {
            User: {
              select: {
                id: true,
                username: true,
                email: true,
                role: true
              }
            }
          }
        });

        // Update user role to PUBLISHER
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { role: 'PUBLISHER' },
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        });

        return { publisher, updatedUser };
      });

      return {
        message: 'Publisher account created successfully',
        publisher: result.publisher,
        user: result.updatedUser
      };

    } catch (error) {
      console.error('Error creating publisher account:', error);
      throw new BadRequestException('Failed to create publisher account');
    }
  }

  async findAll() {
    return this.databaseService.publisher.findMany({
      include: {
        User: {
          select: {
            username: true,
            email: true,
            role: true
          }
        },
        Game: true
      }
    });
  }

  async findOne(id: number) {
    const publisher = await this.databaseService.publisher.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            username: true,
            email: true,
            role: true
          }
        },
        Game: true
      }
    });

    if (!publisher) {
      throw new NotFoundException('Publisher not found');
    }

    return publisher;
  }

  // Add this method to your PublishersService class
async findByUserId(userId: number) {
  const publisher = await this.databaseService.publisher.findFirst({
    where: { userId },
    include: {
      User: {
        select: {
          username: true,
          email: true,
          role: true
        }
      },
      Game: {
        include: {
          gameAccessibilityTags: {
            include: {
              accessibilityTags: true
            }
          }
        }
      }
    }
  });

  if (!publisher) {
    throw new NotFoundException('Publisher account not found for this user');
  }

  return publisher;
}
}