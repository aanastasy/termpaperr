import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import type { Registration } from "../models/registration.entity.js";
import * as registrationsService from "../services/registrations.service.js";

const createRegistrationSchema = z.object({
  bookId: z.string().uuid(),
  paymentMethod: z.string().min(1).max(100),
});

function getIdParam(req: Request): string {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] : id;
}

function mapRegistrationParticipant(registration: Registration) {
  return {
    id: registration.id,
    paymentMethod: registration.paymentMethod,
    createdAt: registration.createdAt,
    user: {
      id: registration.user.id,
      name: registration.user.name,
      email: registration.user.email,
    },
  };
}

export async function createRegistration(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const parsed = createRegistrationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation error",
        issues: parsed.error.flatten(),
      });
      return;
    }

    const registration = await registrationsService.createRegistration({
      userId: req.auth.userId,
      bookId: parsed.data.bookId,
      paymentMethod: parsed.data.paymentMethod,
    });
    res.status(201).json(registration);
  } catch (err) {
    if (
      err instanceof registrationsService.RegistrationNotFoundError ||
      err instanceof registrationsService.RegistrationConflictError
    ) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }
    next(err);
  }
}

export async function cancelRegistration(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    await registrationsService.cancelRegistration(getIdParam(req), req.auth.userId);
    res.status(204).send();
  } catch (err) {
    if (
      err instanceof registrationsService.RegistrationNotFoundError ||
      err instanceof registrationsService.RegistrationConflictError ||
      err instanceof registrationsService.RegistrationUnauthorizedError
    ) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }
    next(err);
  }
}

export async function listRegistrationsByBook(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const registrations =
      await registrationsService.listActiveRegistrationsByBookId(getIdParam(req));
    res.status(200).json(registrations.map(mapRegistrationParticipant));
  } catch (err) {
    if (err instanceof registrationsService.RegistrationNotFoundError) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }
    next(err);
  }
}

export async function listMyRegistrations(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const registrations = await registrationsService.listMyActiveRegistrations(
      req.auth.userId,
    );
    res.status(200).json(registrations);
  } catch (err) {
    next(err);
  }
}
