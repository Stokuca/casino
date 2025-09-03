import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from '../players/player.entity';
import { Transaction } from '../transactions/transaction.entity';
import { CommonModule } from '../common/common.module';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([Player, Transaction])],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
