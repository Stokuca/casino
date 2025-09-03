import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { GameCode } from '../common/enums';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 👇 ovde koristiš enum
  @Column({ type: 'enum', enum: GameCode, enumName: 'game_code', unique: true })
  code: GameCode;

  @Column()
  name: string;

  // 👇 ovde NIKAKO enum, nego numeric jer je procenat RTP-a
  @Column({ type: 'numeric', precision: 5, scale: 2 })
  rtpTheoretical: string; // npr. "96.00"
}
