import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PlayerJwtGuard } from './player-jwt.guard';
import { OperatorJwtGuard } from './operator-jwt.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET'),     // iz .env
        signOptions: { expiresIn: '7d' },          // ili koliko želiš
      }),
    }),
  ],
  providers: [PlayerJwtGuard, OperatorJwtGuard],
  exports: [PlayerJwtGuard, OperatorJwtGuard, JwtModule],
})
export class CommonModule {}
