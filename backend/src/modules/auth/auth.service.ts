// backend/src/modules/auth/auth.service.ts
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { QueryFailedError } from 'typeorm/error/QueryFailedError';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { Player } from '../players/player.entity';
import { Transaction } from '../transactions/transaction.entity';
import { TxType } from '../common/enums';
import { Operator } from '../operators/operator.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly ds: DataSource,
    private readonly jwt: JwtService,
    private readonly cfg: ConfigService,
  ) {}

  private signJwt(payload: Record<string, any>, secret: string) {
    const expiresIn = this.cfg.get<string>('JWT_EXPIRES') ?? '1d';
    return this.jwt.signAsync(payload, { secret, expiresIn });
  }

  // REGISTRACIJA: kreira igrača + inicijalni DEPOSIT ($1000 default)
  async register(email: string, password: string) {
    const normEmail = email.trim().toLowerCase();
    const initialCentsEnv = this.cfg.get<string>('INITIAL_DEPOSIT_CENTS');
    const INITIAL = BigInt(initialCentsEnv ?? '100000'); // $1000 default

    const hash = await bcrypt.hash(password, 10);

    let player: Player;
    try {
      player = await this.ds.transaction(async (q) => {
        const pRepo = q.getRepository(Player);
        const txRepo = q.getRepository(Transaction);

        // 1) Kreiraj igrača sa nulom…
        const created = await pRepo.save(
          pRepo.create({ email: normEmail, passwordHash: hash, balanceCents: '0' }),
        );

        // 2) Ažuriraj balans na početni iznos…
        await pRepo.update(created.id, { balanceCents: INITIAL.toString() });

        // 3) Upis početne DEPOSIT transakcije (bez igre)
        await txRepo.save(
          txRepo.create({
            playerId: created.id,
            type: TxType.DEPOSIT,
            amountCents: INITIAL.toString(),
            balanceAfterCents: INITIAL.toString(),
            // ako je Transaction.game obavezan, učini kolonu nullable u entitetu/migraciji
            meta: { reason: 'initial_credit' },
          }),
        );

        return created;
      });
    } catch (e) {
      // robustno hvatanje unique email (Postgres 23505)
      if (
        e instanceof QueryFailedError &&
        // @ts-ignore – driver specific
        (e as any).code === '23505'
      ) {
        throw new BadRequestException('Email already in use');
      }
      throw e;
    }

    const accessToken = await this.signJwt(
      { sub: player.id, role: 'player', email: player.email },
      this.cfg.get<string>('JWT_PLAYER_SECRET')!,
    );

    return { accessToken };
  }

  async playerLogin(email: string, password: string) {
    const normEmail = email.trim().toLowerCase();
    const repo = this.ds.getRepository(Player);
    const user = await repo.findOne({ where: { email: normEmail } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.signJwt(
      { sub: user.id, role: 'player', email: user.email },
      this.cfg.get<string>('JWT_PLAYER_SECRET')!,
    );

    return { accessToken };
  }

  async operatorLogin(email: string, password: string) {
    const normEmail = email.trim().toLowerCase();
    const repo = this.ds.getRepository(Operator);
    const op = await repo.findOne({ where: { email: normEmail } });
    if (!op) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, op.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.signJwt(
      { sub: op.id, role: 'operator', email: op.email },
      this.cfg.get<string>('JWT_OPERATOR_SECRET')!,
    );

    return { accessToken };
  }
}
