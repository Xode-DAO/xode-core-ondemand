import { Module } from '@nestjs/common';
import { ExtrinsicsService } from './extrinsics.service';
import { ExtrinsicsController } from './extrinsics.controller';
import { ApiModule } from '../api/api.module';

@Module({
  imports:[ApiModule],
  providers: [ExtrinsicsService],
  controllers: [ExtrinsicsController],
  exports:[ExtrinsicsService]
})
export class ExtrinsicsModule {}
