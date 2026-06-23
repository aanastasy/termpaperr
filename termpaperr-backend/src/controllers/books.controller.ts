import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import type { UpdateBookInput } from "../repositories/book.repository.js";
import * as booksService from "../services/books.service.js";
import { coverUrlSchema } from "../validation/cover-url.schema.js";

const bookCreateSchema = z.object({
  title: z.string().min(1).max(255),
  author: z.string().min(1).max(255),
  genre: z.string().min(1).max(100),
  rating: z.coerce.number().min(0).max(5),
  coverUrl: coverUrlSchema,
  description: z.string().min(1),
  price: z.coerce.number().min(0),
  availableSpots: z.coerce.number().int().min(0),
});

const bookUpdateSchema = bookCreateSchema.partial();

function firstQueryValue(val: unknown): unknown {
  return Array.isArray(val) ? val[0] : val;
}

const listBooksQuerySchema = z.object({
  search: z.preprocess((val) => {
    const raw = firstQueryValue(val);
    if (raw === undefined || raw === null) return undefined;
    if (typeof raw !== "string") return undefined;
    const t = raw.trim();
    return t.length ? t : undefined;
  }, z.string().max(500).optional()),
  genre: z.preprocess((val) => {
    const raw = firstQueryValue(val);
    if (raw === undefined || raw === null) return undefined;
    if (typeof raw !== "string") return undefined;
    const t = raw.trim();
    return t.length ? t : undefined;
  }, z.string().max(100).optional()),
  rating: z.preprocess((val) => {
    const raw = firstQueryValue(val);
    if (raw === undefined || raw === null || raw === "") return undefined;
    return raw;
  }, z.coerce.number().min(0).max(5).optional()),
});

function getIdParam(req: Request): string {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] : id;
}

function formatBookPayload(data: z.infer<typeof bookCreateSchema>) {
  return {
    ...data,
    rating: data.rating.toFixed(2),
    price: data.price.toFixed(2),
  };
}

export async function listBooks(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = listBooksQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation error",
        issues: parsed.error.flatten(),
      });
      return;
    }
    const books = await booksService.listBooks(parsed.data);
    res.status(200).json(books);
  } catch (err) {
    next(err);
  }
}

export async function getBook(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const book = await booksService.getBookById(getIdParam(req));
    res.status(200).json(book);
  } catch (err) {
    if (err instanceof booksService.BookNotFoundError) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }
    next(err);
  }
}

export async function createBook(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = bookCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation error",
        issues: parsed.error.flatten(),
      });
      return;
    }
    const created = await booksService.createNewBook(formatBookPayload(parsed.data));
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function updateBook(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = bookUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation error",
        issues: parsed.error.flatten(),
      });
      return;
    }
    const updatePayload: UpdateBookInput = {};
    if (parsed.data.title !== undefined) updatePayload.title = parsed.data.title;
    if (parsed.data.author !== undefined) updatePayload.author = parsed.data.author;
    if (parsed.data.genre !== undefined) updatePayload.genre = parsed.data.genre;
    if (parsed.data.coverUrl !== undefined) updatePayload.coverUrl = parsed.data.coverUrl;
    if (parsed.data.description !== undefined) {
      updatePayload.description = parsed.data.description;
    }
    if (parsed.data.availableSpots !== undefined) {
      updatePayload.availableSpots = parsed.data.availableSpots;
    }
    if (parsed.data.rating !== undefined) {
      updatePayload.rating = parsed.data.rating.toFixed(2);
    }
    if (parsed.data.price !== undefined) {
      updatePayload.price = parsed.data.price.toFixed(2);
    }
    const updated = await booksService.editBook(getIdParam(req), updatePayload);
    res.status(200).json(updated);
  } catch (err) {
    if (err instanceof booksService.BookNotFoundError) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }
    next(err);
  }
}

export async function deleteBook(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await booksService.deleteBook(getIdParam(req));
    res.status(204).send();
  } catch (err) {
    if (err instanceof booksService.BookNotFoundError) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }
    next(err);
  }
}
