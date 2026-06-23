import "reflect-metadata";
import "dotenv/config";
import path from "node:path";
import { DataSource } from "typeorm";

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://termpaperr:termpaperr@127.0.0.1:5432/termpaperr";
const isProduction = process.env.NODE_ENV === "production";
/** Use migrations in dev/prod. Set TYPEORM_SYNC=true only for quick local experiments. */
const synchronize = process.env.TYPEORM_SYNC === "true";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: databaseUrl,
  synchronize,
  logging: !isProduction,
  entities: [path.join(__dirname, "..", "models", "*.entity.{ts,js}")],
  migrations: [path.join(__dirname, "..", "migrations", "*.{ts,js}")],
});
