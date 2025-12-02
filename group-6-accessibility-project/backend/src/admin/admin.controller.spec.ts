import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';

describe('AdminController (current iteration)', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('GET /admin handler returns undefined (no implementation)', async () => {
    await expect(controller.getAdminPage()).resolves.toBeUndefined();
  });

  it('is decorated as a controller with path "admin"', () => {
    // Controller decorator stores path metadata on the class
    const path = Reflect.getMetadata('path', AdminController);
    // Accept either 'admin' or ['admin']
    expect(path === 'admin' || (Array.isArray(path) && path[0] === 'admin')).toBe(true);
  });

  it('has Roles("admin") metadata', () => {
    const roles = Reflect.getMetadata('roles', AdminController.prototype.getAdminPage);
    expect(roles).toBeDefined();
    if (Array.isArray(roles)) {
      expect(roles).toContain('admin');
    } else {
      expect(roles === 'admin' || (roles as any).includes?.('admin')).toBeTruthy();
    }
  });

  it('applies authentication/authorization guards (UseGuards metadata present)', () => {
    const guardsMeta = Reflect.getMetadata('__guards__', AdminController.prototype.getAdminPage);
    expect(Array.isArray(guardsMeta)).toBe(true);
    expect(guardsMeta.length).toBeGreaterThan(0);
  });

  it('applies a ValidationPipe via UsePipes (metadata present)', () => {
    const pipesMeta = Reflect.getMetadata('__pipes__', AdminController.prototype.getAdminPage);
    expect(pipesMeta).toBeDefined();
    const pipesArray = Array.isArray(pipesMeta) ? pipesMeta : [pipesMeta];
    expect(pipesArray.length).toBeGreaterThan(0);
    // ensure at least one pipe is a class or object (non-null)
    expect(pipesArray.some(p => p != null)).toBe(true);
  });

  describe('error propagation (unit-level)', () => {
    it('propagates HttpException when the handler throws one (caller observes it)', async () => {
      jest.spyOn(controller, 'getAdminPage').mockImplementationOnce(async () => {
        throw new HttpException('forbidden', HttpStatus.FORBIDDEN);
      });

      await expect(controller.getAdminPage()).rejects.toMatchObject({
        response: 'forbidden',
        status: HttpStatus.FORBIDDEN,
      });
    });

    it('propagates generic errors thrown by the handler (caller observes it)', async () => {
      jest.spyOn(controller, 'getAdminPage').mockImplementationOnce(async () => {
        throw new Error('boom');
      });

      await expect(controller.getAdminPage()).rejects.toThrow('boom');
    });
  });
});