import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UsePipes, ValidationPipe, HttpException, HttpStatus, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get()
    @Roles('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
    async getAdminPage() {
        try {
            return await this.adminService.get();
        } catch (error) {
            // Re-throw HTTP exceptions as-is
            if (error instanceof HttpException) {
                throw error;
            }
            // Don't leak internal errors
            throw new HttpException('Failed to retrieve game details', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}