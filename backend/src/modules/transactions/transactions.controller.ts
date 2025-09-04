import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { PlayerJwtGuard } from '../common/player-jwt.guard';
import { TransactionsService } from './transactions.service';
import { QueryTransactionsDto } from './dto/query-transactions.dto';

@UseGuards(PlayerJwtGuard)
@Controller('me/transactions')
export class TransactionsController {
  constructor(private readonly svc: TransactionsService) {}

  @Get()
  list(@Req() req: any, @Query() query: QueryTransactionsDto) {
    return this.svc.listForPlayer(req.user.sub, query);
  }
}
