import {
    WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { JwtService } from '@nestjs/jwt';
  import { ConfigService } from '@nestjs/config';
  import { getUserFromHandshake } from './socket-auth';
  
  @WebSocketGateway({
    namespace: '/ws',
    cors: { origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true },
    serveClient: true,   // ⬅️ bitno
  })
  
  export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() io: Server;
    constructor(private readonly jwt: JwtService, private readonly cfg: ConfigService) {}
  
    handleConnection(client: Socket) {
      // token može stići iz auth.token (browser) ili iz authorization headera (npr. Postman/Node klijent)
      const raw =
        (client.handshake.auth?.token as string | undefined) ||
        (client.handshake.headers.authorization as string | undefined) ||
        '';
    
      const authHeader = raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`;
    
      const user = getUserFromHandshake(authHeader, this.jwt, this.cfg);
      if (!user) return client.disconnect(true);
    
      client.data.user = user;
      if (user.role === 'player') client.join(`player:${user.sub}`);
      if (user.role === 'operator') client.join('operator:all');
    }
    
  
    handleDisconnect(_client: Socket) {}
  
    // --- Emit helpers (koristi ih u servisima) ---
    emitPlayerBalance(playerId: string, balanceCents: string) {
      this.io.to(`player:${playerId}`).emit('balance:update', { balanceCents });
    }
  
    emitPlayerTx(playerId: string, tx: any) {
      this.io.to(`player:${playerId}`).emit('transaction:new', tx);
    }
  
    // delta GGR = BET - PAYOUT za jednu ruku; front može da animira brojač
    emitRevenueTick(ggrDeltaCents: string) {
      this.io.to('operator:all').emit('revenue:tick', {
        ggrDeltaCents,
        at: new Date().toISOString(),
      });
    }
  
    // “refetch signal” za operator dashboard
    emitMetricsChanged(kind: 'revenue' | 'game' | 'player') {
      this.io.to('operator:all').emit('metrics:changed', {
        kind,
        at: new Date().toISOString(),
      });
    }
  }
  