// // src/modules/operators/operators.module.ts
// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';

// import { MetricsController } from './metrics.controller';
// import { MetricsService } from './metrics.service';


// import { Transaction } from '../../transactions/transaction.entity';
// import { Player } from '../../players/player.entity';

// import { CommonModule } from '../../common/common.module';
// import { OperatorsPlayersController } from '../operators-players.controller';
// import { OperatorsPlayersService } from '../operators-players.service';
// import { OperatorJwtGuard } from '../../common/operator-jwt.guard';

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([Transaction, Player]),
//     CommonModule, // treba da export-uje JwtModule
//   ],
//   controllers: [MetricsController, OperatorsPlayersController],
//   providers: [MetricsService, OperatorsPlayersService, OperatorJwtGuard],
// })
// export class OperatorsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from '../players/player.entity';
import { Transaction } from '../transactions/transaction.entity';
import { OperatorsPlayersController } from './operators-players.controller';
import { OperatorsPlayersService } from './operators-players.service';
import { MetricsController } from './dto/metrics.controller';
import { MetricsService } from './dto/metrics.service';
import { CommonModule } from '../common/common.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Player]),
    CommonModule, // donosi JwtService i export-ovan OperatorJwtGuard
  ],
  controllers: [MetricsController, OperatorsPlayersController],
  providers: [MetricsService, OperatorsPlayersService],
})
export class OperatorsModule {}

