import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'loword', name: 'tb_user' }) // public schema로 변경
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  name: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 65, nullable: true })
  password?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ length: 25, nullable: true })
  nickname?: string;

  @Column({ length: 30, nullable: true })
  kakao_key?: string;

  @Column({ length: 30, nullable: true })
  google_key?: string;

  @Column({ length: 30, nullable: true })
  naver_key?: string;

  @Column({ type: 'text', nullable: true })
  profile_image?: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ default: false, nullable: true })
  is_active?: boolean;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'text', nullable: true })
  address_detail?: string;

  @Column({ length: 20, nullable: true })
  eng_name?: string;
}
