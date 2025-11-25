import { DatabaseService } from './database.service';

const connectMock = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      $connect = connectMock;
      $disconnect = jest.fn();
    },
  };
});

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(() => {
    connectMock.mockClear();
    service = new DatabaseService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect to Prisma on module init', async () => {
    await service.onModuleInit();

    expect(connectMock).toHaveBeenCalledTimes(1);
  });
});
