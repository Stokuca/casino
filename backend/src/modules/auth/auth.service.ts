// backend/src/modules/auth/auth.service.ts
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Player } from '../players/player.entity';
import { Transaction } from '../transactions/transaction.entity';
import { TxType } from '../common/enums';
import { Operator } from '../operator.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly ds: DataSource,
    private readonly jwt: JwtService,
    private readonly cfg: ConfigService,
  ) {}

  // REGISTRACIJA: kreira igrača + inicijalni DEPOSIT $1000
  async register(email: string, password: string) {
    const playerRepo = this.ds.getRepository(Player);
    if (await playerRepo.findOne({ where: { email } })) {
      throw new BadRequestException('Email already in use');
    }

    const hash = await bcrypt.hash(password, 10);

    const player = await this.ds.transaction(async (q) => {
      const pRepo = q.getRepository(Player);
      const txRepo = q.getRepository(Transaction);

      const created = await pRepo.save({ email, passwordHash: hash, balanceCents: '0' });

      const start = BigInt(100_000); // $1000
      await pRepo.update(created.id, { balanceCents: start.toString() });

      await txRepo.save({
        playerId: created.id,
        type: TxType.DEPOSIT,                 // ✅ enum, ne string
        amountCents: start.toString(),
        balanceAfterCents: start.toString(),
        meta: { reason: 'initial_credit' },
      });

      return created;
    });

    const token = await this.jwt.signAsync(
      { sub: player.id, role: 'player', email: player.email },
      { secret: this.cfg.get('JWT_PLAYER_SECRET'), expiresIn: this.cfg.get('JWT_EXPIRES') ?? '1d' },
    );
    return { accessToken: token };
  }

  async playerLogin(email: string, password: string) {
    const repo = this.ds.getRepository(Player);
    const user = await repo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, role: 'player', email: user.email };
    const token = await this.jwt.signAsync(payload, {
      secret: this.cfg.get('JWT_PLAYER_SECRET'),
      expiresIn: this.cfg.get('JWT_EXPIRES') ?? '1d',
    });
    return { accessToken: token };
  }

  async operatorLogin(email: string, password: string) {
    const repo = this.ds.getRepository(Operator);
    const op = await repo.findOne({ where: { email } });
    if (!op) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, op.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: op.id, role: 'operator', email: op.email };
    const token = await this.jwt.signAsync(payload, {
      secret: this.cfg.get('JWT_OPERATOR_SECRET'),
      expiresIn: this.cfg.get('JWT_EXPIRES') ?? '1d',
    });
    return { accessToken: token };
  }
}
