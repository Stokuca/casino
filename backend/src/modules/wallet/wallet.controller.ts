import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { PlayerJwtGuard } from '../common/player-jwt.guard';
import { AmountDto } from './dto/wallet.dto';
import { WalletService } from './wallet.service';

@ApiTags('Wallet')
@ApiBearerAuth('access-token')
@UseGuards(PlayerJwtGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Post('deposit')
  @ApiOperation({ summary: 'Deposit funds' })
  @ApiOkResponse({
    schema: {
      example: {
        txId: 'a1b2c3d4-5678-90ab-cdef-000000000001',
        balanceCents: '120000'
      }
    }
  })
  deposit(@Req() req: any, @Body() dto: AmountDto) {
    return this.wallet.deposit(req.user.sub, dto.amountCents);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Withdraw funds' })
  @ApiOkResponse({
    schema: {
      example: {
        txId: 'w1x2y3z4-5678-90ab-cdef-000000000002',
        balanceCents: '115000'
      }
    }
  })
  withdraw(@Req() req: any, @Body() dto: AmountDto) {
    return this.wallet.withdraw(req.user.sub, dto.amountCents);
  }
}
