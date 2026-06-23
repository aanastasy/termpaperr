import { Router } from "express";

import * as booksController from "../controllers/books.controller.js";
import * as registrationsController from "../controllers/registrations.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleGuard } from "../middleware/role.guard.js";
import { UserRole } from "../models/user.entity.js";

const router = Router();

router.get("/", booksController.listBooks);
router.get(
  "/:id/registrations",
  authMiddleware,
  roleGuard(UserRole.Admin),
  registrationsController.listRegistrationsByBook,
);
router.get("/:id", booksController.getBook);
router.post(
  "/",
  authMiddleware,
  roleGuard(UserRole.Admin),
  booksController.createBook,
);
router.put(
  "/:id",
  authMiddleware,
  roleGuard(UserRole.Admin),
  booksController.updateBook,
);
router.delete(
  "/:id",
  authMiddleware,
  roleGuard(UserRole.Admin),
  booksController.deleteBook,
);

export default router;
