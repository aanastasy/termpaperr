import {
  createBook,
  findBooks,
  findBookById,
  removeBook,
  updateBook,
  type BookListFilters,
  type CreateBookInput,
  type UpdateBookInput,
} from "../repositories/book.repository.js";
import type { Book } from "../models/book.entity.js";
import { deleteCoverFileIfLocal } from "./upload.service.js";

export class BookNotFoundError extends Error {
  readonly statusCode = 404;
}

/** Query params for GET /books: `rating` = minimum stars inclusive (0–5). */
export interface ListBooksQuery {
  search?: string;
  genre?: string;
  rating?: number;
}

export async function listBooks(query: ListBooksQuery = {}): Promise<Book[]> {
  const filters: BookListFilters = {
    search: query.search,
    genre: query.genre,
    minRating: query.rating,
  };
  return findBooks(filters);
}

export async function getBookById(id: string): Promise<Book> {
  const book = await findBookById(id);
  if (!book) {
    throw new BookNotFoundError("Book not found");
  }
  return book;
}

export async function createNewBook(input: CreateBookInput): Promise<Book> {
  return createBook(input);
}

export async function editBook(id: string, input: UpdateBookInput): Promise<Book> {
  const book = await findBookById(id);
  if (!book) {
    throw new BookNotFoundError("Book not found");
  }
  const previousCoverUrl = book.coverUrl;
  const updated = await updateBook(book, input);

  if (
    input.coverUrl !== undefined &&
    input.coverUrl !== previousCoverUrl
  ) {
    await deleteCoverFileIfLocal(previousCoverUrl);
  }

  return updated;
}

export async function deleteBook(id: string): Promise<void> {
  const book = await findBookById(id);
  if (!book) {
    throw new BookNotFoundError("Book not found");
  }
  await removeBook(book);
  await deleteCoverFileIfLocal(book.coverUrl);
}
