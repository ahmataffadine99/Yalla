import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'varchar', length: 320, unique: true })
  email!: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 16, unique: true })
  phoneNumber!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 256 })
  passwordHash!: string;

  @Column({
    name: 'email_verified_at',
    type: 'timestamptz',
    nullable: true,
  })
  emailVerifiedAt!: Date | null;

  @Column({
    name: 'email_verification_token_hash',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  emailVerificationTokenHash!: string | null;

  @Column({
    name: 'email_verification_expires_at',
    type: 'timestamptz',
    nullable: true,
  })
  emailVerificationExpiresAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
