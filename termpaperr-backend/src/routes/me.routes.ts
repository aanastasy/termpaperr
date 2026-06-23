import { Router } from "express";

import { getMe, updateProfile } from "../controllers/me.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getMe);
router.patch("/", authMiddleware, updateProfile);

export default router;
