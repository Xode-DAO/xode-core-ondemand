import { Test, TestingModule } from '@nestjs/testing';
import { OnDemandController } from './on-demand.controller';

describe('OnDemandController', () => {
  let controller: OnDemandController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnDemandController],
    }).compile();

    controller = module.get<OnDemandController>(OnDemandController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
