import express from "express";
import swaggerUi from "swagger-ui-express";

import { ensureUploadDir, resolveUploadDir } from "./config/uploads.js";
import { openApiSpec } from "./config/openapi.js";
import authRoutes from "./routes/auth.routes.js";
import booksRoutes from "./routes/books.routes.js";
import healthRoutes from "./routes/health.routes.js";
import meRoutes from "./routes/me.routes.js";
import registrationsRoutes from "./routes/registrations.routes.js";
import uploadsRoutes from "./routes/uploads.routes.js";

export function createApp() {
  ensureUploadDir();

  const app = express();
  const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3001";

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", corsOrigin);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.use(express.json());
  app.use("/uploads/covers", express.static(resolveUploadDir()));
  app.get("/", (_req, res) => {
    res.redirect("/docs");
  });
  app.use("/health", healthRoutes);
  app.get("/openapi.json", (_req, res) => {
    res.json(openApiSpec);
  });
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
  app.use("/auth", authRoutes);
  app.use("/books", booksRoutes);
  app.use("/me", meRoutes);
  app.use("/registrations", registrationsRoutes);
  app.use("/uploads", uploadsRoutes);

  return app;
}
