import { Router } from "express";

import * as registrationsController from "../controllers/registrations.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, registrationsController.createRegistration);
router.delete("/:id", authMiddleware, registrationsController.cancelRegistration);
router.get("/my", authMiddleware, registrationsController.listMyRegistrations);

export default router;
