import { Test, TestingModule } from '@nestjs/testing';
import { ExtrinsicsController } from './extrinsics.controller';

describe('ExtrinsicsController', () => {
  let controller: ExtrinsicsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExtrinsicsController],
    }).compile();

    controller = module.get<ExtrinsicsController>(ExtrinsicsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
