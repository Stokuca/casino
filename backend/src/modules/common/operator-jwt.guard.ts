import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken'; // KORISTIMO jsonwebtoken direktno

@Injectable()
export class OperatorJwtGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const auth = req.headers['authorization'] as string | undefined;

    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }

    const token = auth.slice(7);
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret') as any;

      if (payload?.role !== 'OPERATOR') {
        throw new UnauthorizedException('Wrong role');
      }
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
