import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum UserRole {
  Admin = "admin",
  Author = "author",
  User = "user",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255, default: "" })
  name!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255, name: "password_hash" })
  passwordHash!: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.User,
  })
  role!: UserRole;

  @Column({ name: "email_verified_at", type: "timestamptz", nullable: true })
  emailVerifiedAt!: Date | null;

  @Column({
    name: "email_verification_token_hash",
    type: "varchar",
    length: 64,
    nullable: true,
  })
  emailVerificationTokenHash!: string | null;

  @Column({
    name: "email_verification_token_expires_at",
    type: "timestamptz",
    nullable: true,
  })
  emailVerificationTokenExpiresAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
