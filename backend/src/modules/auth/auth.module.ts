// backend/src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from '../players/player.entity';
import { Operator } from '../operator.entity';
import { Transaction } from '../transactions/transaction.entity';
import { JwtModule } from '@nestjs/jwt';
import { Game } from '../games/game.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player, Operator, Transaction, Game]),
    JwtModule.register({}), // sign/verify tajne čitaš u servisu iz ConfigService
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule], // eksportuješ JwtModule da ga koriste guard-ovi
})
export class AuthModule {}
