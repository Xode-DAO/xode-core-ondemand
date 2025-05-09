import { Module } from '@nestjs/common';
import { OnDemandService } from './on-demand.service';
import { OnDemandController } from './on-demand.controller';
import { ExtrinsicsModule } from '../extrinsics/extrinsics.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnDemandEntity } from './onDemand.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OnDemandEntity]),
    ExtrinsicsModule],
  providers: [OnDemandService],
  controllers: [OnDemandController]
})
export class OnDemandModule {}
