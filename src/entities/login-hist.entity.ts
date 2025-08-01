import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity({ schema: 'loword', name: 'tb_login_hist' }) // public schema로 변경
export class LoginHist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ type: 'text' })
  access_token: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'now()' })
  logined_at: Date;

  @Column({ length: 16 })
  ip_address: string;

  @Column({ type: 'text' })
  user_agent: string;

  @Column({ length: 10 })
  login_type: string;

  @Column()
  success: boolean;

  @Column({ type: 'text' })
  fail_reason: string;
}
