import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [RealtimeGateway, JwtService],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
