import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from '../players/player.entity';
import { Transaction } from '../transactions/transaction.entity';
import { Game } from '../games/game.entity';
import { CommonModule } from '../common/common.module';
import { BetsController } from './bets.controller';
import { BetsService } from './bets.service';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([Player, Transaction, Game]), RealtimeModule],
  controllers: [BetsController],
  providers: [BetsService],
})
export class BetsModule {}
