import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("books")
export class Book {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "varchar", length: 255 })
  author!: string;

  @Column({ type: "varchar", length: 100 })
  genre!: string;

  @Column({ type: "numeric", precision: 3, scale: 2, default: 0 })
  rating!: string;

  @Column({ type: "varchar", length: 2048, name: "cover_url" })
  coverUrl!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  price!: string;

  @Column({ type: "integer", name: "available_spots" })
  availableSpots!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
