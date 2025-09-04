import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OperatorJwtGuard } from './operator-jwt.guard';
import { PlayerJwtGuard } from './player-jwt.guard';

@Module({
  imports: [
    ConfigModule, // global je, ali treba za registerAsync
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET') || 'devsecret',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  providers: [OperatorJwtGuard, PlayerJwtGuard],
  exports: [JwtModule, OperatorJwtGuard, PlayerJwtGuard], // KLJUČNO
})
export class CommonModule {}
