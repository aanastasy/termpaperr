import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Book } from "./book.entity";
import { User } from "./user.entity";

export enum RegistrationStatus {
  Active = "active",
  Cancelled = "cancelled",
}

@Entity("registrations")
@Unique(["userId", "bookId"])
export class Registration {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "user_id" })
  userId!: string;

  @Column({ type: "uuid", name: "book_id" })
  bookId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Book, { onDelete: "CASCADE" })
  @JoinColumn({ name: "book_id" })
  book!: Book;

  @Column({ type: "varchar", length: 100, name: "payment_method" })
  paymentMethod!: string;

  @Column({
    type: "enum",
    enum: RegistrationStatus,
    default: RegistrationStatus.Active,
  })
  status!: RegistrationStatus;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
