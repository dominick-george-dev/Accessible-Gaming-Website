import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { AwsService } from '../services/aws/aws.service';

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

const mockFiles: Express.Multer.File[] = [mockFile];

// ✅ Create a proper mock for AwsService
const mockAwsService = {
  uploadFile: jest.fn(),
  uploadMultipleFiles: jest.fn(),
  deleteFile: jest.fn(),
};

describe('UploadController', () => {
  let controller: UploadController;
  let awsService: AwsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: AwsService,
          useValue: mockAwsService, // ✅ Provide the mock service
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    awsService = module.get<AwsService>(AwsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadImages', () => {
    it('should upload multiple images successfully', async () => {
      const mockUrls = ['https://d123456789.cloudfront.net/image1.jpg'];
      mockAwsService.uploadMultipleFiles.mockResolvedValue(mockUrls);

      const result = await controller.uploadImages(mockFiles);

      expect(awsService.uploadMultipleFiles).toHaveBeenCalledWith(mockFiles);
      expect(result).toEqual({
        success: true,
        urls: mockUrls,
        message: '1 images uploaded successfully'
      });
    });

    it('should handle upload errors', async () => {
      const errorMessage = 'Upload failed';
      mockAwsService.uploadMultipleFiles.mockRejectedValue(new Error(errorMessage));

      const result = await controller.uploadImages(mockFiles);

      expect(result).toEqual({
        success: false,
        message: errorMessage
      });
    });
  });

  describe('uploadSingleImage', () => {
    it('should upload single image successfully', async () => {
      const mockUrl = 'https://d123456789.cloudfront.net/image.jpg';
      mockAwsService.uploadFile.mockResolvedValue(mockUrl);

      const result = await controller.uploadSingleImage(mockFile);

      expect(awsService.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(result).toEqual({
        success: true,
        url: mockUrl,
        message: 'Image uploaded successfully'
      });
    });

    it('should handle single upload failure', async () => {
      const errorMessage = 'Single upload failed';
      mockAwsService.uploadFile.mockRejectedValue(new Error(errorMessage));

      const result = await controller.uploadSingleImage(mockFile);

      expect(result).toEqual({
        success: false,
        message: errorMessage
      });
    });
  });
});