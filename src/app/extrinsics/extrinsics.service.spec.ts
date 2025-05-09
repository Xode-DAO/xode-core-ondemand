import { Test, TestingModule } from '@nestjs/testing';
import { ExtrinsicsService } from './extrinsics.service';

describe('ExtrinsicsService', () => {
  let service: ExtrinsicsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExtrinsicsService],
    }).compile();

    service = module.get<ExtrinsicsService>(ExtrinsicsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
