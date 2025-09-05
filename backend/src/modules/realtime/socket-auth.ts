import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export function getUserFromHandshake(
  authHeader: string | undefined,
  jwt: JwtService,
  cfg: ConfigService,
) {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);

  const playerSecret = cfg.get<string>('JWT_PLAYER_SECRET')!;
  const operatorSecret = cfg.get<string>('JWT_OPERATOR_SECRET')!;

  try {
    // prvo probaj player secret…
    return jwt.verify(token, { secret: playerSecret }) as any;
  } catch {
    try {
      // …pa operator secret
      return jwt.verify(token, { secret: operatorSecret }) as any;
    } catch {
      return null;
    }
  }
}
