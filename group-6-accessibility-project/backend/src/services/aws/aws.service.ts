import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class AwsService {
    private s3: AWS.S3;
    private bucketName: string;
    private cloudFrontUrl: string;

    constructor() {
        this.bucketName = process.env.AWS_S3_BUCKET_NAME!;
        this.cloudFrontUrl = process.env.CLOUDFRONT_URL!;

        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION,
        });
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const key = `${Date.now()}-${file.originalname}`;

        const uploadParams = {
            Bucket: this.bucketName!,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        };


        try {
            const result = await this.s3.upload(uploadParams).promise();

            // Return CloudFront URL instead of S3 URL
            const cloudFrontUrl = `${process.env.CLOUDFRONT_URL}/${key}`;
            console.log('Uploaded to S3:', result.Location);
            console.log('Returning CloudFront URL:', cloudFrontUrl);

            return cloudFrontUrl;
        } catch (error) {
            throw new Error(`Failed to upload file to S3: ${error.message}`);
        }
    }

    async uploadMultipleFiles(files: Express.Multer.File[]): Promise<string[]> {
        const uploadPromises = files.map(file => this.uploadFile(file));
        return Promise.all(uploadPromises);
    }

    async deleteFile(fileUrl: string): Promise<void> {
        // Extract key from CloudFront URL
        const key = fileUrl.split('/').pop(); // Get the last part (filename)

        const deleteParams = {
            Bucket: this.bucketName!,
            Key: key!,
        };

        try {
            await this.s3.deleteObject(deleteParams).promise();
        } catch (error) {
            throw new Error(`Failed to delete file from S3: ${error.message}`);
        }
    }
}