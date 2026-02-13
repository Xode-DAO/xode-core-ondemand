import { Injectable, Logger } from '@nestjs/common';
import { ApiService } from '../api/api.service';
import { Keyring } from '@polkadot/api';
import { ExtrinsicsService } from '../extrinsics/extrinsics.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnDemandEntity } from './onDemand.entity';
import { config } from 'dotenv';

config();

@Injectable()
export class OnDemandService {
  private readonly logger = new Logger(OnDemandService.name);
  private isProcessing = false;
  
  // Update these with your actual para IDs
  private readonly PASEO_PARA_ID = 5109; // Make sure this is correct!
  
  private readonly PASEO_AMOUNT = 0.01;
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
      // Convert amount to smallest units
      const paseoAmountInSmallestUnit = this.convertToSmallestUnit(this.PASEO_AMOUNT, this.PASEO_DECIMALS);
  
      // Prepare signer using mnemonic
      const keyring = new Keyring({ type: 'sr25519' });
      const signer = keyring.addFromUri(process.env.MNEMONIC!);
  
      // Get Paseo API and nonce
      const paseoApi = await this.apiService.getPaseoApi();
      const { nonce: paseoNonce } = await paseoApi.query.system.account(signer.address) as any;
  
      // Create the transaction call
      const paseoCall = paseoApi.tx.onDemand.placeOrderAllowDeath(
        paseoAmountInSmallestUnit,
        this.PASEO_PARA_ID
      );
      
      // Send transaction with empty extrinsics array (since you've commented out the extrinsics logic)
      await this.sendTransaction(paseoCall, signer, paseoNonce, 'Xode Paseo', paseoAmountInSmallestUnit, []);
  
    } catch (error) {
      this.logger.error('❌ Error checking and placing order:', error);
      console.error('Detailed error:', error);
    } finally {
      this.isProcessing = false;
    }
  }
  
  private async sendTransaction(call, signer, nonce, chain: string, amount: number, extrinsics: any[]): Promise<void> {
    try {
      this.logger.log(`🚀 Sending ${chain} transaction with nonce: ${nonce.toString()}`);
      
      await call.signAndSend(signer, { nonce }, async ({ status, events }) => {
        try {
          this.logger.log(`📤 ${chain} Transaction status: ${status.type}`);
          
          if (status.isInBlock) {
            const blockhash = status.asInBlock.toHex();
            this.logger.log(`✅ ${chain} Transaction included in block: ${blockhash}`);
            
            // Check for errors in events
            if (events) {
              events.forEach(({ event }) => {
                if (event.method === 'ExtrinsicFailed') {
                  this.logger.error(`❌ ${chain} Transaction failed in block ${blockhash}`);
                  // Log dispatch error info if available
                  const [dispatchError] = event.data;
                  this.logger.error(`Dispatch error: ${dispatchError.toString()}`);
                }
              });
            }
          }
          
          if (status.isFinalized) {
            const blockhash = status.asFinalized.toHex();
            this.logger.log(`🏁 ${chain} Transaction finalized: ${blockhash}`);
            
            // Store order if needed (for non-Paseo chains)
            if (chain !== 'Xode Paseo' && extrinsics.length > 0) {
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
      } else if (error.message?.includes('1010')) {
        this.logger.error(`❌ ${chain} Transaction failed: Invalid Transaction`);
      } else {
        this.logger.error(`❌ Error with ${chain} transaction:`, error);
      }
    }
  }
  
  // Save orders to the database
  private async storeOrder(blockhash: string, chain: string, amount: number, extrinsics: any[]) {
    if (chain === 'Xode Paseo') return;
    
    const result = JSON.stringify(extrinsics);
    const onDemandOrder = this.onDemandRepository.create({
      blockhash,
      result,
      timestamp: new Date(),
      chain,
    });

    await this.onDemandRepository.save(onDemandOrder);
    this.logger.log(`✅ OnDemand order saved with chain: ${chain}, blockhash: ${blockhash}`);
  }

  // Start the order cycle
  private startOrderCycle(): void {
    const runCycle = async () => {
      try {
        await this.checkAndPlaceOrder();
      } catch (error) {
        this.logger.error('❌ Error in order cycle:', error);
      } finally {
        setTimeout(runCycle, 6000); // Wait 6 seconds after completion
      }
    };
  
    runCycle(); // Start the first cycle
  }
}
