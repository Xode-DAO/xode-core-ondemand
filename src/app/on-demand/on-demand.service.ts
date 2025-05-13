import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ApiService } from '../api/api.service';  // Import the ApiService
import { ApiPromise, Keyring } from '@polkadot/api';
import { ExtrinsicsService } from '../extrinsics/extrinsics.service'; // Import your ExtrinsicsService
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnDemandEntity } from './onDemand.entity'; // Import OnDemandEntity
import { config } from 'dotenv';

config();

@Injectable()
export class OnDemandService {
  private readonly logger = new Logger(OnDemandService.name);
  private isProcessing = false;
  
  private readonly KUSAMA_PARA_ID = 3344;
  private readonly POLKADOT_PARA_ID = 3417;
  private readonly PASEO_PARA_ID = 4607;
  
  private readonly KUSAMA_AMOUNT = 0.005;
  private readonly POLKADOT_AMOUNT = 0.025;
  private readonly PASEO_AMOUNT = 0.001;
  
  private readonly KUSAMA_DECIMALS = 12;
  private readonly POLKADOT_DECIMALS = 10;
  private readonly PASEO_DECIMALS = 10;
  
  constructor(
    private readonly apiService: ApiService,
    private readonly extrinsicsService: ExtrinsicsService,
    @InjectRepository(OnDemandEntity)
    private readonly onDemandRepository: Repository<OnDemandEntity>
  ) {
    this.startOrderCycle();
  }

  

  private convertToSmallestUnit(amount: number, decimals: number): number {
    return amount * Math.pow(10, decimals);
  }


  async checkAndPlaceOrder(): Promise<void> {
    if (this.isProcessing) {
      this.logger.warn('⚠️ Still processing previous orders. Skipping this cycle.');
      return;
    }

    this.isProcessing = true;
    try {
      // Fetch pending extrinsics using the ExtrinsicsService
      const kusamaExtrinsics = await this.extrinsicsService.getPendingXodeKusama();
      const polkadotExtrinsics = await this.extrinsicsService.getPendingXodePolkadot();
  
      // Logging the extrinsics received from Kusama and Polkadot
      this.logger.log(`📥 KUSAMA: Pending Extrinsics: ${JSON.stringify(kusamaExtrinsics)}`);
      this.logger.log(`📥 POLKADOT: Pending Extrinsics: ${JSON.stringify(polkadotExtrinsics)}`);

      // 🔍 Check if extrinsics already exist
      const kusamaExists = kusamaExtrinsics.length > 0 && await this.extrinsicsService.ifExtrinsicsExist(kusamaExtrinsics);
      const polkadotExists = polkadotExtrinsics.length > 0 && await this.extrinsicsService.ifExtrinsicsExist(polkadotExtrinsics);
      
      // If either already exists, terminate the cycle early
      if (kusamaExists || polkadotExists) {
        this.logger.warn('⛔ Extrinsics already exist in DB. Skipping this cycle.');
        return;
      }
      
      // 💾 Save new extrinsics to the database only if they are not empty
      if (kusamaExtrinsics.length > 0) {
        await this.extrinsicsService.saveExtrinsics(kusamaExtrinsics);
      }
      if (polkadotExtrinsics.length > 0) {
        await this.extrinsicsService.saveExtrinsics(polkadotExtrinsics);
      }
        
  
      // Convert amounts to smallest units
      const kusamaAmountInSmallestUnit = this.convertToSmallestUnit(this.KUSAMA_AMOUNT, this.KUSAMA_DECIMALS);
      const polkadotAmountInSmallestUnit = this.convertToSmallestUnit(this.POLKADOT_AMOUNT, this.POLKADOT_DECIMALS);
      const paseoAmountInSmallestUnit = this.convertToSmallestUnit(this.PASEO_AMOUNT, this.PASEO_DECIMALS);
  
      // Prepare signer using mnemonic
      const keyring = new Keyring({ type: 'sr25519' });
      const signer = keyring.addFromUri(process.env.MNEMONIC!);
  
      // Get the nonce for Kusama and Polkadot
      const kusamaApi = await this.apiService.getKusamaApi();
      const polkadotApi = await this.apiService.getPolkadotApi();
      const paseoApi = await this.apiService.getPaseoApi();
  
      const { nonce: kusamaNonce } = await kusamaApi.query.system.account(signer.address) as any;
      const { nonce: polkadotNonce } = await polkadotApi.query.system.account(signer.address) as any;
      const { nonce: paseoNonce } = await paseoApi.query.system.account(signer.address) as any;
  
      // Check Kusama extrinsics and place order if pending
      if (kusamaExtrinsics.length > 0) {
        this.logger.log('📥 Kusama has pending extrinsics. Placing order...');
        const kusamaCall = kusamaApi.tx.onDemandAssignmentProvider.placeOrderAllowDeath(
          kusamaAmountInSmallestUnit,
          this.KUSAMA_PARA_ID
        );
        await this.sendTransaction(kusamaCall, signer, kusamaNonce, 'Xode Kusama', kusamaAmountInSmallestUnit, kusamaExtrinsics);
      } else {
        this.logger.log('📭 No pending extrinsics found on Kusama.');
      }
  
      // Check Polkadot extrinsics and place order if pending
      if (polkadotExtrinsics.length > 0) {
        this.logger.log('📥 Polkadot has pending extrinsics. Placing order...');
        const polkadotCall = polkadotApi.tx.onDemand.placeOrderAllowDeath(
          polkadotAmountInSmallestUnit,
          this.POLKADOT_PARA_ID
        );
        await this.sendTransaction(polkadotCall, signer, polkadotNonce, 'Xode Polkadot', polkadotAmountInSmallestUnit, polkadotExtrinsics);
      } else {
        this.logger.log('📭 No pending extrinsics found on Polkadot.');
      }
  
      // Proceed with Paseo transaction (this can remain unconditional as it's separate)
      const paseoCall = paseoApi.tx.onDemand.placeOrderAllowDeath(
        paseoAmountInSmallestUnit,
        this.PASEO_PARA_ID
      );
      await this.sendTransaction(paseoCall, signer, paseoNonce, 'Xode Paseo', paseoAmountInSmallestUnit, kusamaExtrinsics);
  
    } catch (error) {
      this.logger.error('❌ Error checking and placing order:', error);
    }
    finally {
      this.isProcessing = false;
    }
  }
  
  
  // Helper function to send transactions and handle errors gracefully
  private async sendTransaction(call, signer, nonce, chain: string, amount: number, extrinsics: any): Promise<void> {
    try {
      const signedExtrinsic = await call.signAsync(signer, { nonce });

      await signedExtrinsic.send(async ({ status }) => {
        try {
          if (status.isFinalized) {
            const blockhash = status.asFinalized.toHex();
            this.logger.log(`✅ ${chain} Transaction finalized: ${blockhash}`);
            if (chain !== 'Xode Paseo') {
              await this.storeOrder(blockhash, chain, amount, extrinsics);
            }
          }
        } catch (callbackError) {
          this.logger.error(`❌ Error inside ${chain} transaction callback:`, callbackError);
        }
      });
    } catch (error) {
      if (error.message?.includes('Inability to pay some fees')) {
        this.logger.error(`❌ ${chain} Transaction failed due to insufficient funds: ${error.message}`);
      } else {
        this.logger.error(`❌ Error with ${chain} transaction:`, error);
      }
    }
  }
  

  // Save orders to the database
  private async storeOrder(blockhash: string, chain: string, amount: number, extrinsics: any) {
    if (chain === 'Xode Paseo') return;
    const result = `${JSON.stringify(extrinsics)}`;

    const onDemandOrder = this.onDemandRepository.create({
      blockhash,
      result,
      timestamp: new Date(),
      chain,
    });

    await this.onDemandRepository.save(onDemandOrder);
    this.logger.log(`✅ OnDemand order saved with chain: ${chain}, blockhash: ${blockhash}`);
  }

  // Start the order cycle (every 12 seconds)
  private startOrderCycle(): void {
    const runCycle = async () => {
      try {
        await this.checkAndPlaceOrder();
      } catch (error) {
        this.logger.error('❌ Error placing order:', error);
      } finally {
        setTimeout(runCycle, 12000); // Wait 12 seconds after completion
      }
    };
  
    runCycle(); // Start the first cycle
  }
}