import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlayerJwtGuard } from './player-jwt.guard';
import { OperatorJwtGuard } from './operator-jwt.guard';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule, 
    JwtModule.register({}), // <-- sad guardovi vide JwtService
  ],
  providers: [PlayerJwtGuard, OperatorJwtGuard],
  exports: [PlayerJwtGuard, OperatorJwtGuard, JwtModule],
})
export class CommonModule {}
