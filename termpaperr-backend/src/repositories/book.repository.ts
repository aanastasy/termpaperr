import { AppDataSource } from "../config/data-source.js";
import { Book } from "../models/book.entity.js";

export interface CreateBookInput {
  title: string;
  author: string;
  genre: string;
  rating: string;
  coverUrl: string;
  description: string;
  price: string;
  availableSpots: number;
}

export interface UpdateBookInput {
  title?: string;
  author?: string;
  genre?: string;
  rating?: string;
  coverUrl?: string;
  description?: string;
  price?: string;
  availableSpots?: number;
}

export interface BookListFilters {
  /** Case-insensitive substring match on title, author, description. */
  search?: string;
  /** Case-insensitive exact match on genre. */
  genre?: string;
  /** Minimum rating inclusive (numeric column in DB). */
  minRating?: number;
}

export async function findBooks(filters: BookListFilters = {}): Promise<Book[]> {
  const repo = AppDataSource.getRepository(Book);
  const qb = repo.createQueryBuilder("book");

  if (filters.search !== undefined && filters.search.length > 0) {
    const pattern = `%${filters.search}%`;
    qb.andWhere(
      "(book.title ILIKE :search OR book.author ILIKE :search OR book.description ILIKE :search)",
      { search: pattern },
    );
  }

  if (filters.genre !== undefined && filters.genre.length > 0) {
    qb.andWhere("LOWER(book.genre) = LOWER(:genre)", {
      genre: filters.genre,
    });
  }

  if (filters.minRating !== undefined) {
    qb.andWhere("book.rating >= :minRating", { minRating: filters.minRating });
  }

  return qb.orderBy("book.createdAt", "DESC").getMany();
}

export async function findBookById(id: string): Promise<Book | null> {
  return AppDataSource.getRepository(Book).findOne({ where: { id } });
}

export async function createBook(input: CreateBookInput): Promise<Book> {
  const repo = AppDataSource.getRepository(Book);
  const book = repo.create(input);
  return repo.save(book);
}

export async function updateBook(
  book: Book,
  input: UpdateBookInput,
): Promise<Book> {
  const repo = AppDataSource.getRepository(Book);
  Object.assign(book, input);
  return repo.save(book);
}

export async function removeBook(book: Book): Promise<void> {
  await AppDataSource.getRepository(Book).remove(book);
}
