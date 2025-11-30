import { Test, TestingModule } from '@nestjs/testing';
import { AwsService } from './aws.service';

// ✅ Mock AWS SDK BEFORE importing anything else
const mockS3Instance = {
  upload: jest.fn(),
  deleteObject: jest.fn(),
};

const mockS3 = jest.fn(() => mockS3Instance);

// ✅ Move jest.mock to the top and use inline mocking
jest.mock('aws-sdk', () => ({
  S3: jest.fn(() => ({
    upload: jest.fn(),
    deleteObject: jest.fn(),
  })),
}));

// Mock environment variables
const mockEnvVars = {
  AWS_S3_BUCKET_NAME: 'test-bucket',
  CLOUDFRONT_URL: 'https://d123456789.cloudfront.net',
  AWS_ACCESS_KEY_ID: 'test-access-key',
  AWS_SECRET_ACCESS_KEY: 'test-secret-key',
  AWS_REGION: 'us-east-1',
};

// Mock file data
const mockFile: Express.Multer.File = {
  fieldname: 'image',
  originalname: 'test-image.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 1024,
  buffer: Buffer.from('fake image data'),
  stream: null as any,
  destination: '',
  filename: 'test-image.jpg',
  path: '',
};

const mockFiles: Express.Multer.File[] = [
  {
    ...mockFile,
    originalname: 'image1.jpg',
    filename: 'image1.jpg',
  },
  {
    ...mockFile,
    originalname: 'image2.png',
    filename: 'image2.png',
    mimetype: 'image/png',
  },
];

describe('AwsService', () => {
  let service: AwsService;
  let originalEnv: NodeJS.ProcessEnv;
  let mockS3Client: any;

  beforeAll(() => {
    // Save original environment
    originalEnv = process.env;
    
    // Set mock environment variables
    process.env = { ...originalEnv, ...mockEnvVars };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // ✅ Create a fresh mock S3 instance for each test
    mockS3Client = {
      upload: jest.fn(),
      deleteObject: jest.fn(),
    };

    // ✅ Mock the S3 constructor to return our mock instance
    const AWS = require('aws-sdk');
    AWS.S3 = jest.fn(() => mockS3Client);
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [AwsService],
    }).compile();

    service = module.get<AwsService>(AwsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload a single file successfully', async () => {
      const mockS3Response = {
        Location: 'https://test-bucket.s3.amazonaws.com/123456789-test-image.jpg',
      };

      const mockUpload = {
        promise: jest.fn().mockResolvedValue(mockS3Response),
      };

      mockS3Client.upload.mockReturnValue(mockUpload);

      // Mock Date.now() to ensure consistent key generation
      const mockTimestamp = 1234567890;
      jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

      const result = await service.uploadFile(mockFile);

      expect(mockS3Client.upload).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: `${mockTimestamp}-test-image.jpg`,
        Body: mockFile.buffer,
        ContentType: 'image/jpeg',
      });

      expect(result).toBe(`https://d123456789.cloudfront.net/${mockTimestamp}-test-image.jpg`);

      // Restore Date.now()
      jest.restoreAllMocks();
    });

    it('should handle upload errors', async () => {
      const mockError = new Error('S3 upload failed');
      const mockUpload = {
        promise: jest.fn().mockRejectedValue(mockError),
      };

      mockS3Client.upload.mockReturnValue(mockUpload);

      await expect(service.uploadFile(mockFile)).rejects.toThrow(
        'Failed to upload file to S3: S3 upload failed'
      );

      expect(mockS3Client.upload).toHaveBeenCalled();
    });

    it('should generate unique keys for different files', async () => {
      const mockS3Response = {
        Location: 'https://test-bucket.s3.amazonaws.com/test-file.jpg',
      };

      const mockUpload = {
        promise: jest.fn().mockResolvedValue(mockS3Response),
      };

      mockS3Client.upload.mockReturnValue(mockUpload);

      // Mock different timestamps
      const timestamps = [1111111111, 2222222222];
      let callCount = 0;
      jest.spyOn(Date, 'now').mockImplementation(() => timestamps[callCount++]);

      const file1 = { ...mockFile, originalname: 'file1.jpg' };
      const file2 = { ...mockFile, originalname: 'file2.jpg' };

      await service.uploadFile(file1);
      await service.uploadFile(file2);

      expect(mockS3Client.upload).toHaveBeenNthCalledWith(1, expect.objectContaining({
        Key: '1111111111-file1.jpg',
      }));

      expect(mockS3Client.upload).toHaveBeenNthCalledWith(2, expect.objectContaining({
        Key: '2222222222-file2.jpg',
      }));

      jest.restoreAllMocks();
    });

    it('should handle different file types correctly', async () => {
      const mockS3Response = {
        Location: 'https://test-bucket.s3.amazonaws.com/test-file.png',
      };

      const mockUpload = {
        promise: jest.fn().mockResolvedValue(mockS3Response),
      };

      mockS3Client.upload.mockReturnValue(mockUpload);

      const pngFile = {
        ...mockFile,
        originalname: 'test.png',
        mimetype: 'image/png',
      };

      await service.uploadFile(pngFile);

      expect(mockS3Client.upload).toHaveBeenCalledWith(expect.objectContaining({
        ContentType: 'image/png',
      }));
    });
  });

  describe('uploadMultipleFiles', () => {
    it('should upload multiple files successfully', async () => {
      const mockS3Response = {
        Location: 'https://test-bucket.s3.amazonaws.com/test-file.jpg',
      };

      const mockUpload = {
        promise: jest.fn().mockResolvedValue(mockS3Response),
      };

      mockS3Client.upload.mockReturnValue(mockUpload);

      // Mock timestamps for consistent results
      const timestamps = [1111111111, 2222222222];
      let callCount = 0;
      jest.spyOn(Date, 'now').mockImplementation(() => timestamps[callCount++]);

      const result = await service.uploadMultipleFiles(mockFiles);

      expect(mockS3Client.upload).toHaveBeenCalledTimes(2);
      expect(result).toEqual([
        'https://d123456789.cloudfront.net/1111111111-image1.jpg',
        'https://d123456789.cloudfront.net/2222222222-image2.png',
      ]);

      jest.restoreAllMocks();
    });

    it('should handle empty file array', async () => {
      const result = await service.uploadMultipleFiles([]);

      expect(mockS3Client.upload).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle partial failures in multiple uploads', async () => {
      const mockUploadSuccess = {
        promise: jest.fn().mockResolvedValue({
          Location: 'https://test-bucket.s3.amazonaws.com/success.jpg',
        }),
      };

      const mockUploadFailure = {
        promise: jest.fn().mockRejectedValue(new Error('Upload failed')),
      };

      // First call succeeds, second call fails
      mockS3Client.upload
        .mockReturnValueOnce(mockUploadSuccess)
        .mockReturnValueOnce(mockUploadFailure);

      await expect(service.uploadMultipleFiles(mockFiles)).rejects.toThrow(
        'Failed to upload file to S3: Upload failed'
      );

      expect(mockS3Client.upload).toHaveBeenCalledTimes(2);
    });
  });

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      const mockDelete = {
        promise: jest.fn().mockResolvedValue({}),
      };

      mockS3Client.deleteObject.mockReturnValue(mockDelete);

      const fileUrl = 'https://d123456789.cloudfront.net/1234567890-test-image.jpg';

      await service.deleteFile(fileUrl);

      expect(mockS3Client.deleteObject).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: '1234567890-test-image.jpg',
      });
    });

    it('should handle delete errors', async () => {
      const mockError = new Error('S3 delete failed');
      const mockDelete = {
        promise: jest.fn().mockRejectedValue(mockError),
      };

      mockS3Client.deleteObject.mockReturnValue(mockDelete);

      const fileUrl = 'https://d123456789.cloudfront.net/test-file.jpg';

      await expect(service.deleteFile(fileUrl)).rejects.toThrow(
        'Failed to delete file from S3: S3 delete failed'
      );
    });

    it('should extract correct key from CloudFront URL', async () => {
      const mockDelete = {
        promise: jest.fn().mockResolvedValue({}),
      };

      mockS3Client.deleteObject.mockReturnValue(mockDelete);

      const testCases = [
        {
          url: 'https://d123456789.cloudfront.net/simple-file.jpg',
          expectedKey: 'simple-file.jpg',
        },
        {
          url: 'https://d123456789.cloudfront.net/1234567890-complex-file-name.png',
          expectedKey: '1234567890-complex-file-name.png',
        },
      ];

      for (const testCase of testCases) {
        await service.deleteFile(testCase.url);

        expect(mockS3Client.deleteObject).toHaveBeenCalledWith({
          Bucket: 'test-bucket',
          Key: testCase.expectedKey,
        });

        jest.clearAllMocks();
      }
    });

    it('should handle malformed URLs gracefully', async () => {
      const mockDelete = {
        promise: jest.fn().mockResolvedValue({}),
      };

      mockS3Client.deleteObject.mockReturnValue(mockDelete);

      const malformedUrl = 'https://example.com/';

      await service.deleteFile(malformedUrl);

      expect(mockS3Client.deleteObject).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: expect.any(String), // Will be empty string or last segment
      });
    });
  });
});