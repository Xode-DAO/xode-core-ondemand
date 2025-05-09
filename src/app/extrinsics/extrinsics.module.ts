import { Module } from '@nestjs/common';
import { ExtrinsicsService } from './extrinsics.service';
import { ExtrinsicsController } from './extrinsics.controller';

@Module({
  providers: [ExtrinsicsService],
  controllers: [ExtrinsicsController],
  exports:[ExtrinsicsService]
})
export class ExtrinsicsModule {}
