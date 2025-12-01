import { Controller, Post, UseInterceptors, UploadedFiles, UploadedFile } from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { AwsService } from '../services/aws/aws.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly awsService: AwsService) {}

  @Post('images')
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    try {
      const imageUrls = await this.awsService.uploadMultipleFiles(files);
      return {
        success: true,
        urls: imageUrls,
        message: `${files.length} images uploaded successfully`
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  @Post('single-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadSingleImage(@UploadedFile() file: Express.Multer.File) {
    try {
      const imageUrl = await this.awsService.uploadFile(file);
      return {
        success: true,
        url: imageUrl,
        message: 'Image uploaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}