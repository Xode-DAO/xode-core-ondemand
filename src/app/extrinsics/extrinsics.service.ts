import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExtrinsicsEntity } from './extrinsics.entity';
import { ApiService } from '../api/api.service';

@Injectable()
export class ExtrinsicsService {
  constructor(
    private readonly apiService: ApiService,
    @InjectRepository(ExtrinsicsEntity)
    private readonly extrinsicsRepository: Repository<ExtrinsicsEntity>,
  ) {}

  async getPendingXodeKusama(): Promise<any[]> {
    const api = await this.apiService.getXodeKusamaApi();
    const extrinsics = await api.rpc.author.pendingExtrinsics();
    return extrinsics.map(ext => ext.toHuman());
  }

  async getPendingXodePolkadot(): Promise<any[]> {
    const api = await this.apiService.getXodePolkadotApi();
    const extrinsics = await api.rpc.author.pendingExtrinsics();
    return extrinsics.map(ext => ext.toHuman());
  }

  // Save extrinsics to the database
  async saveExtrinsics(extrinsics: any[]): Promise<void> {
    const serialized = JSON.stringify(extrinsics);

    const record = this.extrinsicsRepository.create({
      result: serialized,
      timestamp: new Date(),
    });

    await this.extrinsicsRepository.save(record);
  }

  async ifExtrinsicsExist(extrinsics: any[]): Promise<boolean> {
    const serialized = JSON.stringify(extrinsics);
    const exists = await this.extrinsicsRepository.findOne({ where: { result: serialized } });
    return !!exists;
  }
}
