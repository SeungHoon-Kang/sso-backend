import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'loword', name: 'tb_user_role' })
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  role: string;

  @Column()
  provider: string;
}
