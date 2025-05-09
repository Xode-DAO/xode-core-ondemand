import { Test, TestingModule } from '@nestjs/testing';
import { OnDemandService } from './on-demand.service';

describe('OnDemandService', () => {
  let service: OnDemandService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OnDemandService],
    }).compile();

    service = module.get<OnDemandService>(OnDemandService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
