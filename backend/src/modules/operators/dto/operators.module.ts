import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { Transaction } from '../../transactions/transaction.entity';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), CommonModule],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class OperatorsModule {}
