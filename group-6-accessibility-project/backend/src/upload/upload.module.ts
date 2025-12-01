import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { AwsService } from '../services/aws/aws.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService, AwsService],
  exports: [UploadService, AwsService]
})
export class UploadModule {}