import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { config } from 'dotenv';

config();

@Injectable()
export class ExtrinsicsService implements OnModuleInit, OnModuleDestroy {
  private xodeKusamaApi: ApiPromise;
  private xodePolkadotApi: ApiPromise;

  async onModuleInit() {
    await this.initApis();
  }

  private async initApis() {
    if (!this.xodeKusamaApi) {
      const kusamaProvider = new WsProvider(process.env.XODE_KUSAMA_RPC_ENPOINT);
      this.xodeKusamaApi = await ApiPromise.create({ provider: kusamaProvider });
      await this.xodeKusamaApi.isReady;
      console.log('✅ Connected to Xode-Kusama RPC');
    }

    if (!this.xodePolkadotApi) {
      const polkadotProvider = new WsProvider(process.env.XODE_POLKADOT_RPC_ENPOINT);
      this.xodePolkadotApi = await ApiPromise.create({ provider: polkadotProvider });
      await this.xodePolkadotApi.isReady;
      console.log('✅ Connected to Xode-Polkadot RPC');
    }
  }

  async getPendingXodeKusama(): Promise<any[]> {
    const extrinsics = await this.xodeKusamaApi.rpc.author.pendingExtrinsics();
    return extrinsics.map(ext => ext.toHuman());
  }

  async getPendingXodePolkadot(): Promise<any[]> {
    const extrinsics = await this.xodePolkadotApi.rpc.author.pendingExtrinsics();
    return extrinsics.map(ext => ext.toHuman());
  }

  async onModuleDestroy() {
    if (this.xodeKusamaApi) {
      await this.xodeKusamaApi.disconnect();
      console.log('❌ Disconnected from Xode-Kusama RPC');
    }

    if (this.xodePolkadotApi) {
      await this.xodePolkadotApi.disconnect();
      console.log('❌ Disconnected from Xode-Polkadot RPC');
    }
  }
}
