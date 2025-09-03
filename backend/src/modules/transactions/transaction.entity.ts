// backend/src/modules/transactions/transaction.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { Player } from '../players/player.entity';
  import { Game } from '../games/game.entity';
  import { TxType } from '../common/enums';
  
  @Entity('transactions')
  export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    // --- Player veze ---
    @Index()
    @Column()
    playerId: string;
  
    @ManyToOne(() => Player, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'playerId' })
    player: Player;
  
    // --- Game (opciono) ---
    @Index()
    @Column({ nullable: true })
    gameId?: string | null;
  
    @ManyToOne(() => Game, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'gameId' })
    game?: Game | null;
  
    // --- Tip transakcije (enum) ---
    @Column({ type: 'enum', enum: TxType, enumName: 'tx_type' })
    type: TxType; // 'DEPOSIT' | 'WITHDRAWAL' | 'BET' | 'PAYOUT'
  
    // --- Iznosi u centima (bigint kao string u TS) ---
    @Column({ type: 'bigint' })
    amountCents: string; // +deposit/payout, -bet/withdraw
  
    @Column({ type: 'bigint' })
    balanceAfterCents: string; // audit trail
  
    // --- Dodatni meta podaci ---
    @Column({ type: 'jsonb', nullable: true })
    meta?: Record<string, any> | null;
  
    @Index()
    @CreateDateColumn()
    createdAt: Date;
  }
  