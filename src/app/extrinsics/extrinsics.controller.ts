import { Controller, Get } from '@nestjs/common';
import { ExtrinsicsService } from './extrinsics.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Extrinsics')
@Controller('extrinsics')
export class ExtrinsicsController {
  constructor(private readonly extrinsicsService: ExtrinsicsService) {}

  @Get('kusama')
  @ApiOperation({ summary: 'Get pending extrinsics from Xode Kusama RPC' })
  @ApiResponse({ status: 200, description: 'List of pending extrinsics from Kusama' })
  async getXodeKusamaExtrinsics() {
    return await this.extrinsicsService.getPendingXodeKusama();
  }

  @Get('polkadot')
  @ApiOperation({ summary: 'Get pending extrinsics from Xode Polkadot RPC' })
  @ApiResponse({ status: 200, description: 'List of pending extrinsics from Polkadot' })
  async getXodePolkadotExtrinsics() {
    return await this.extrinsicsService.getPendingXodePolkadot();
  }
}
