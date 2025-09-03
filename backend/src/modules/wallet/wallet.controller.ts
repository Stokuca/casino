import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { PlayerJwtGuard } from '../common/player-jwt.guard';
import { AmountDto } from './dto/wallet.dto';
import { WalletService } from './wallet.service';

@UseGuards(PlayerJwtGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Post('deposit')
  deposit(@Req() req: any, @Body() dto: AmountDto) {
    return this.wallet.deposit(req.user.sub, dto.amountCents);
  }

  @Post('withdraw')
  withdraw(@Req() req: any, @Body() dto: AmountDto) {
    return this.wallet.withdraw(req.user.sub, dto.amountCents);
  }
}
