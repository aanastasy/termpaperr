import { AppDataSource } from "../config/data-source.js";
import { Book } from "../models/book.entity.js";
import {
  Registration,
  RegistrationStatus,
} from "../models/registration.entity.js";
import { findBookById } from "../repositories/book.repository.js";
import { findUserById } from "../repositories/user.repository.js";
import { sendBookRegistrationConfirmationEmail } from "./registration-email.service.js";

export class RegistrationUnauthorizedError extends Error {
  readonly statusCode = 401;
}

export class RegistrationNotFoundError extends Error {
  readonly statusCode = 404;
}

export class RegistrationConflictError extends Error {
  readonly statusCode = 409;
}

export interface CreateRegistrationInput {
  userId: string;
  bookId: string;
  paymentMethod: string;
}

export async function createRegistration(
  input: CreateRegistrationInput,
): Promise<Registration> {
  const registration = await AppDataSource.transaction(async (manager) => {
    const bookRepo = manager.getRepository(Book);
    const registrationRepo = manager.getRepository(Registration);

    const book = await bookRepo.findOne({
      where: { id: input.bookId },
      lock: { mode: "pessimistic_write" },
    });
    if (!book) {
      throw new RegistrationNotFoundError("Book not found");
    }
    if (book.availableSpots <= 0) {
      throw new RegistrationConflictError("No available spots");
    }

    const existing = await registrationRepo.findOne({
      where: { userId: input.userId, bookId: input.bookId },
      lock: { mode: "pessimistic_write" },
    });

    if (existing?.status === RegistrationStatus.Active) {
      throw new RegistrationConflictError("Already registered for this book");
    }

    book.availableSpots -= 1;
    await bookRepo.save(book);

    if (existing?.status === RegistrationStatus.Cancelled) {
      existing.status = RegistrationStatus.Active;
      existing.paymentMethod = input.paymentMethod;
      return registrationRepo.save(existing);
    }

    const created = registrationRepo.create({
      userId: input.userId,
      bookId: input.bookId,
      paymentMethod: input.paymentMethod,
      status: RegistrationStatus.Active,
    });
    return registrationRepo.save(created);
  });

  const [user, book] = await Promise.all([
    findUserById(registration.userId),
    findBookById(registration.bookId),
  ]);
  if (user?.email) {
    await sendBookRegistrationConfirmationEmail({
      to: user.email,
      bookTitle: book?.title ?? "Book",
      bookAuthor: book?.author ?? "",
      paymentMethod: registration.paymentMethod,
      registrationId: registration.id,
    }).catch((err) => {
      console.error(
        "[registrations] Failed to send registration confirmation email",
        err,
      );
    });
  }

  return registration;
}

export async function cancelRegistration(
  registrationId: string,
  userId: string,
): Promise<void> {
  return AppDataSource.transaction(async (manager) => {
    const registrationRepo = manager.getRepository(Registration);
    const bookRepo = manager.getRepository(Book);

    const registration = await registrationRepo.findOne({
      where: { id: registrationId },
      lock: { mode: "pessimistic_write" },
    });

    if (!registration) {
      throw new RegistrationNotFoundError("Registration not found");
    }
    if (registration.userId !== userId) {
      throw new RegistrationUnauthorizedError("Unauthorized");
    }
    if (registration.status === RegistrationStatus.Cancelled) {
      throw new RegistrationConflictError("Registration already cancelled");
    }

    const book = await bookRepo.findOne({
      where: { id: registration.bookId },
      lock: { mode: "pessimistic_write" },
    });
    if (!book) {
      throw new RegistrationNotFoundError("Book not found");
    }

    registration.status = RegistrationStatus.Cancelled;
    book.availableSpots += 1;

    await registrationRepo.save(registration);
    await bookRepo.save(book);
  });
}

export async function listMyActiveRegistrations(userId: string): Promise<Registration[]> {
  return AppDataSource.getRepository(Registration)
    .createQueryBuilder("registration")
    .leftJoinAndSelect("registration.book", "book")
    .where("registration.userId = :userId", { userId })
    .andWhere("registration.status = :status", {
      status: RegistrationStatus.Active,
    })
    .orderBy("registration.createdAt", "DESC")
    .getMany();
}

export async function listActiveRegistrationsByBookId(
  bookId: string,
): Promise<Registration[]> {
  const book = await findBookById(bookId);
  if (!book) {
    throw new RegistrationNotFoundError("Book not found");
  }

  return AppDataSource.getRepository(Registration)
    .createQueryBuilder("registration")
    .innerJoinAndSelect("registration.user", "user")
    .where("registration.bookId = :bookId", { bookId })
    .andWhere("registration.status = :status", {
      status: RegistrationStatus.Active,
    })
    .orderBy("registration.createdAt", "DESC")
    .getMany();
}
