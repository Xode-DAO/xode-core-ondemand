import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('onDemand')
export class OnDemandEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'longtext' })
  result: string;

  @Column({ type: 'varchar', length: 66 }) // hash is 0x + 64 chars
  blockhash: string;

  @Column({ type: 'varchar', length: 32 })
  chain: string;
}
