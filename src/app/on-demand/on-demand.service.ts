import { Injectable, Logger } from '@nestjs/common';
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { ExtrinsicsService } from '../extrinsics/extrinsics.service'; // Import your ExtrinsicsService
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnDemandEntity } from './onDemand.entity'; // Import OnDemandEntity
import { config } from 'dotenv';

config();

@Injectable()
export class OnDemandService {
  private readonly logger = new Logger(OnDemandService.name);
  private kusamaApi: ApiPromise;
  private polkadotApi: ApiPromise;

  private readonly KUSAMA_PARA_ID = 3344; 
  private readonly POLKADOT_PARA_ID = 3417;
  
  private readonly KUSAMA_AMOUNT = 0.005;  
  private readonly POLKADOT_AMOUNT = 0.025; 

  private readonly KUSAMA_DECIMALS = 12;    
  private readonly POLKADOT_DECIMALS = 10;  

  constructor(
    private readonly extrinsicsService: ExtrinsicsService,
    @InjectRepository(OnDemandEntity)
    private readonly onDemandRepository: Repository<OnDemandEntity> // Inject OnDemandRepository
  ) {}

  async onModuleInit() {
    await this.initApis();
    this.startOrderCycle();
  }

  private async initApis() {
    // Initialize Kusama API
    if (!this.kusamaApi) {
      const kusamaProvider = new WsProvider(process.env.KUSAMA_RPC_ENDPOINT);
      this.kusamaApi = await ApiPromise.create({ provider: kusamaProvider });
      await this.kusamaApi.isReady;
      this.logger.log('✅ Connected to Kusama RPC');
    }

    // Initialize Polkadot API
    if (!this.polkadotApi) {
      const polkadotProvider = new WsProvider(process.env.POLKADOT_RPC_ENDPOINT);
      this.polkadotApi = await ApiPromise.create({ provider: polkadotProvider });
      await this.polkadotApi.isReady;
      this.logger.log('✅ Connected to Polkadot RPC');
    }
  }

  private convertToSmallestUnit(amount: number, decimals: number): number {
    return amount * Math.pow(10, decimals); 
  }

  async checkAndPlaceOrder(): Promise<void> {
    try {
      // Fetch pending extrinsics from Kusama and Polkadot using ExtrinsicsService
      const kusamaExtrinsics = await this.extrinsicsService.getPendingXodeKusama();
      const polkadotExtrinsics = await this.extrinsicsService.getPendingXodePolkadot();


    this.logger.log(`📥 KUSAMA: Pending Extrinsics: ${JSON.stringify(kusamaExtrinsics)}`);
    this.logger.log(`📥 POLKADOT: Pending Extrinsics: ${JSON.stringify(polkadotExtrinsics)}`);

      // If no pending extrinsics found for Kusama and Polkadot, exit the method
      if (kusamaExtrinsics.length === 0 && polkadotExtrinsics.length === 0) {
        this.logger.log('📭 No pending extrinsics found on Kusama or Polkadot.');
        return;
      }

      // Convert amounts to smallest units for Kusama and Polkadot
      const kusamaAmountInSmallestUnit = this.convertToSmallestUnit(this.KUSAMA_AMOUNT, this.KUSAMA_DECIMALS);
      const polkadotAmountInSmallestUnit = this.convertToSmallestUnit(this.POLKADOT_AMOUNT, this.POLKADOT_DECIMALS);

      // Prepare signer using mnemonic (private key)
      const keyring = new Keyring({ type: 'sr25519' });
      const signer = keyring.addFromUri(process.env.MNEMONIC!); // Use ! to assert it's not undefined

      // Get the nonce for both Kusama and Polkadot
      const { nonce: kusamaNonce } = await this.kusamaApi.query.system.account(signer.address) as any;
      const { nonce: polkadotNonce } = await this.polkadotApi.query.system.account(signer.address) as any;


      // Create extrinsic calls for Kusama and Polkadot
      const kusamaCall = this.kusamaApi.tx.onDemandAssignmentProvider.placeOrderAllowDeath(
        kusamaAmountInSmallestUnit,
        this.KUSAMA_PARA_ID
      );

      const polkadotCall = this.polkadotApi.tx.onDemandAssignmentProvider.placeOrderAllowDeath(
        polkadotAmountInSmallestUnit,
        this.POLKADOT_PARA_ID
      );

      // Sign and send Kusama transaction
      const signedKusamaExtrinsic = await kusamaCall.signAsync(signer, { nonce: kusamaNonce });
      signedKusamaExtrinsic.send(async ({ status }) => {
        if (status.isInBlock) {
          const blockhash = status.asInBlock.toHex();
          this.logger.log(`✅ Kusama Transaction included in block: ${blockhash}`);
          await this.storeOrder(blockhash, 'Kusama', kusamaAmountInSmallestUnit);
        } else if (status.isFinalized) {
          const blockhash = status.asFinalized.toHex();
          this.logger.log(`✅ Kusama Transaction finalized: ${blockhash}`);
          await this.storeOrder(blockhash, 'Kusama', kusamaAmountInSmallestUnit);
        } else {
          this.logger.log(`⏳ Kusama Transaction status: ${status}`);
        }
      });

      // Sign and send Polkadot transaction
      const signedPolkadotExtrinsic = await polkadotCall.signAsync(signer, { nonce: polkadotNonce });
      signedPolkadotExtrinsic.send(async ({ status }) => {
        if (status.isInBlock) {
          const blockhash = status.asInBlock.toHex();
          this.logger.log(`✅ Polkadot Transaction included in block: ${blockhash}`);
          await this.storeOrder(blockhash, 'Polkadot', polkadotAmountInSmallestUnit);
        } else if (status.isFinalized) {
          const blockhash = status.asFinalized.toHex();
          this.logger.log(`✅ Polkadot Transaction finalized: ${blockhash}`);
          await this.storeOrder(blockhash, 'Polkadot', polkadotAmountInSmallestUnit);
        } else {
          this.logger.log(`⏳ Polkadot Transaction status: ${status}`);
        }
      });

    } catch (error) {
      this.logger.error('❌ Error checking and placing order:', error);
    }
  }

  // Save orders to database (now with blockhash, result, timestamp, and chain)
  private async storeOrder(blockhash: string, chain: string, amount: number) {
    const result = `Order placed on ${chain} with amount: ${amount}`; // Example result

    const onDemandOrder = this.onDemandRepository.create({
      blockhash,
      result,
      timestamp: new Date(),
      chain,
    });

    await this.onDemandRepository.save(onDemandOrder);
    this.logger.log(`✅ OnDemand order saved with chain: ${chain}, blockhash: ${blockhash}`);
  }

  private startOrderCycle(): void {
    setInterval(async () => {
      try {
        this.logger.log('⏳ Checking and placing order on Kusama/Polkadot...');
        await this.checkAndPlaceOrder();
      } catch (error) {
        this.logger.error('❌ Error placing order:', error);
      }
    }, 12000); // Every 12 seconds
  }
}
