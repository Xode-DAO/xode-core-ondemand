import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ApiService } from '../api/api.service';  

@Injectable()
export class ExtrinsicsService {

  constructor(private readonly apiService: ApiService) {}  

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
}
