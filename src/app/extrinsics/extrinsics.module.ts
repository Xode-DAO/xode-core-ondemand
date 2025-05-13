import { Module } from '@nestjs/common';
import { ExtrinsicsService } from './extrinsics.service';
import { ExtrinsicsController } from './extrinsics.controller';
import { ApiModule } from '../api/api.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExtrinsicsEntity } from './extrinsics.entity';

@Module({
  imports: [
    ApiModule,
    TypeOrmModule.forFeature([ExtrinsicsEntity]) // ✅ register entity
  ],
  providers: [ExtrinsicsService],
  controllers: [ExtrinsicsController],
  exports:[ExtrinsicsService]
})
export class ExtrinsicsModule {}
