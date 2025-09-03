import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlayersController } from './players.controller';
import { Player } from './player.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    CommonModule, // donosi PlayerJwtGuard (sad ispravno)
    TypeOrmModule.forFeature([Player]),
  ],
  controllers: [PlayersController],
})
export class PlayersModule {}
