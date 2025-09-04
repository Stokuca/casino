// backend/src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Player } from '../players/player.entity';
import { Operator } from '../operator.entity';
import { Transaction } from '../transactions/transaction.entity';
import { Game } from '../games/game.entity';
import { CommonModule } from '../common/common.module'; // <— dodaj

@Module({
  imports: [
    TypeOrmModule.forFeature([Player, Operator, Transaction, Game]),
    CommonModule, // <— koristi JwtModule iz CommonModule-a (isti secret!)
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService], // <— više ne exportuješ JwtModule
})
export class AuthModule {}
