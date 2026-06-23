import { Router } from "express";

import * as authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.get("/verify-email", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerification);

export default router;
