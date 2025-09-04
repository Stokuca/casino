import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../transactions/transaction.entity';
import { Player } from '../players/player.entity';
import { OperatorsPlayersController } from './operators-players.controller';
import { OperatorsPlayersService } from './operators-players.service';
import { MetricsController } from './dto/metrics.controller';
import { MetricsService } from './dto/metrics.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Player])],
  controllers: [MetricsController, OperatorsPlayersController],
  providers: [MetricsService, OperatorsPlayersService],
})
export class OperatorsModule {}
