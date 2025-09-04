import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';


import { OperatorsPlayersController } from './operators-players.controller';
import { OperatorsPlayersService } from './operators-players.service';
import { Transaction } from '../transactions/transaction.entity';
import { CommonModule } from '../common/common.module';
import { Player } from '../players/player.entity';
import { MetricsController } from './dto/metrics.controller';
import { MetricsService } from './dto/metrics.service';


@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Player]), CommonModule],
  controllers: [MetricsController, OperatorsPlayersController],
  providers: [MetricsService, OperatorsPlayersService],
})
export class OperatorsModule {}
