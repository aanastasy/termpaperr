import "reflect-metadata";
import "dotenv/config";

import { createApp } from "./app.js";
import { AppDataSource } from "./config/data-source.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";

const app = createApp();
const port = Number(process.env.PORT) || 3000;

void Promise.all([AppDataSource.initialize(), connectRedis()])
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  })
  .catch((error: unknown) => {
    console.error("Initialization failed", error);
    process.exit(1);
  });

async function shutdown(signal: string): Promise<void> {
  console.info(`${signal} received, closing connections…`);
  await disconnectRedis().catch(() => undefined);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy().catch(() => undefined);
  }
  process.exit(0);
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
