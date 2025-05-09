import { Module } from '@nestjs/common';
import { OnDemandService } from './on-demand.service';
import { OnDemandController } from './on-demand.controller';
import { ExtrinsicsModule } from '../extrinsics/extrinsics.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnDemandEntity } from './onDemand.entity';
import { ApiModule } from '../api/api.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OnDemandEntity]),
    ExtrinsicsModule,
    ApiModule],
  providers: [OnDemandService],
  controllers: [OnDemandController]
})
export class OnDemandModule {}
