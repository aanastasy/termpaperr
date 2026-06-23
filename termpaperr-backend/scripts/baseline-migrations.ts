/**
 * Marks pending migrations as executed when schema already exists
 * (e.g. after TypeORM synchronize created tables before migration:run).
 *
 * Usage: npx tsx scripts/baseline-migrations.ts
 */
import "dotenv/config";
import pg from "pg";

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://termpaperr:termpaperr@127.0.0.1:5432/termpaperr";

const CHECKS: Array<{ timestamp: number; name: string; sql: string }> = [
  {
    timestamp: 1778504700000,
    name: "CreateBooks1778504700000",
    sql: `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'books'`,
  },
  {
    timestamp: 1778505200000,
    name: "CreateRegistrations1778505200000",
    sql: `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'registrations'`,
  },
  {
    timestamp: 1778505800000,
    name: "AddNameToUsers1778505800000",
    sql: `SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'name'`,
  },
  {
    timestamp: 1778510000000,
    name: "AddEmailVerificationToUsers1778510000000",
    sql: `SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'email_verified_at'`,
  },
];

async function main(): Promise<void> {
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    for (const check of CHECKS) {
      const exists = await client.query(check.sql);
      if (exists.rowCount === 0) {
        console.log(`Skip (not in DB yet): ${check.name}`);
        continue;
      }

      const already = await client.query(
        `SELECT 1 FROM migrations WHERE name = $1`,
        [check.name],
      );
      if (already.rowCount && already.rowCount > 0) {
        console.log(`Already recorded: ${check.name}`);
        continue;
      }

      await client.query(
        `INSERT INTO migrations (timestamp, name) VALUES ($1, $2)`,
        [check.timestamp, check.name],
      );
      console.log(`Marked as executed: ${check.name}`);
    }

    console.log("\nDone. Run: npm run migration:run");
  } finally {
    await client.end();
  }
}

void main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
