import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ExtrinsicsModule } from './app/extrinsics/extrinsics.module';
import { OnDemandModule } from './app/on-demand/on-demand.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnDemandEntity } from './app/on-demand/onDemand.entity';
import { ApiService } from './app/api/api.service';
import { ApiModule } from './app/api/api.module';
import { ExtrinsicsEntity } from './app/extrinsics/extrinsics.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || '1.248.227.169',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'Xode@2024',
      database: process.env.DB_NAME || 'onDemand',
      entities: [OnDemandEntity, ExtrinsicsEntity],
      synchronize: true, // WARNING: disable in production!
    }),
    TypeOrmModule.forFeature([OnDemandEntity]),
    ExtrinsicsModule,
    OnDemandModule,
    ApiModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
