import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ApiPromise, WsProvider } from '@polkadot/api';

@Injectable()
export class ApiService {
  private xodeKusamaApi: ApiPromise;
  private xodePolkadotApi: ApiPromise;
  private kusamaApi: ApiPromise;
  private polkadotApi: ApiPromise;
  private paseoApi: ApiPromise;

  async onModuleInit() {
    await this.initApi();
  }

  private async initApi() {
    try {
      // Initialize Xode Kusama API
      if (!this.xodeKusamaApi) {
        const providerXodeKusama = new WsProvider(process.env.XODE_KUSAMA_RPC_ENDPOINT);
        this.xodeKusamaApi = await ApiPromise.create({ provider: providerXodeKusama });
        await this.xodeKusamaApi.isReady;
        console.log('✅ Connected to Xode Kusama RPC');
      }

      // Initialize Xode Polkadot API
      if (!this.xodePolkadotApi) {
        const providerXodePolkadot = new WsProvider(process.env.XODE_POLKADOT_RPC_ENDPOINT);
        this.xodePolkadotApi = await ApiPromise.create({ provider: providerXodePolkadot });
        await this.xodePolkadotApi.isReady;
        console.log('✅ Connected to Xode Polkadot RPC');
      }

      // Initialize Kusama API
      if (!this.kusamaApi) {
        const providerKusama = new WsProvider(process.env.KUSAMA_RPC_ENDPOINT);
        this.kusamaApi = await ApiPromise.create({ provider: providerKusama });
        await this.kusamaApi.isReady;
        console.log('✅ Connected to Kusama RPC');
      }

      // Initialize Polkadot API
      if (!this.polkadotApi) {
        const providerPolkadot = new WsProvider(process.env.POLKADOT_RPC_ENDPOINT);
        this.polkadotApi = await ApiPromise.create({ provider: providerPolkadot });
        await this.polkadotApi.isReady;
        console.log('✅ Connected to Polkadot RPC');
      }

      if (!this.paseoApi) {
        const providerPolkadot = new WsProvider(process.env.PASEO_RPC_ENDPOINT);
        this.paseoApi = await ApiPromise.create({ provider: providerPolkadot });
        await this.paseoApi.isReady;
        console.log('✅ Connected to Paseo RPC');
      }

    } catch (error) {
      console.error('❌ Error initializing APIs', error.stack);
      throw error;
    }
  }

  // Getter methods for each API
  async getXodeKusamaApi(): Promise<ApiPromise> {
    if (!this.xodeKusamaApi) {
      await this.initApi();
    }
    return this.xodeKusamaApi;
  }

  async getXodePolkadotApi(): Promise<ApiPromise> {
    if (!this.xodePolkadotApi) {
      await this.initApi();
    }
    return this.xodePolkadotApi;
  }

  async getKusamaApi(): Promise<ApiPromise> {
    if (!this.kusamaApi) {
      await this.initApi();
    }
    return this.kusamaApi;
  }

  async getPolkadotApi(): Promise<ApiPromise> {
    if (!this.polkadotApi) {
      await this.initApi();
    }
    return this.polkadotApi;
  }

  async getPaseoApi(): Promise<ApiPromise> {
    if (!this.paseoApi) {
      await this.initApi();
    }
    return this.paseoApi;
  }
}
