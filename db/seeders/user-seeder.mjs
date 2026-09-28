/**
 * Development user seeder.
 *
 * Optional overrides:
 *   SEED_USER_NAME
 *   SEED_USER_EMAIL
 *   SEED_USER_PASSWORD
 */
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const { Pool } = pg;

const demoUser = {
  name: process.env.SEED_USER_NAME?.trim() || "Demo User",
  email: (process.env.SEED_USER_EMAIL?.trim() || "demo@xpensetracker.local").toLowerCase(),
  password: process.env.SEED_USER_PASSWORD || "Demo123!",
};

function databaseConfig() {
  const ssl = process.env.DB_SSL === "true"
    ? { rejectUnauthorized: false }
    : undefined;

  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL, ssl };
  }

  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    ssl,
  };
}

async function seedUser() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("User seeder is disabled in production.");
  }

  if (demoUser.password.length < 8 || demoUser.password.length > 72) {
    throw new Error("SEED_USER_PASSWORD must contain between 8 and 72 characters.");
  }

  const pool = new Pool(databaseConfig());

  try {
    const existing = await pool.query(
      "SELECT id, name, email FROM users WHERE email = $1 LIMIT 1",
      [demoUser.email],
    );

    if (existing.rows[0]) {
      console.log(`User seed skipped: ${existing.rows[0].email} already exists.`);
      return;
    }

    const passwordHash = await bcrypt.hash(demoUser.password, 12);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, name, email`,
      [demoUser.name, demoUser.email, passwordHash],
    );

    if (!result.rows[0]) {
      console.log(`User seed skipped: ${demoUser.email} was created concurrently.`);
      return;
    }

    console.log("Demo user created successfully.");
    console.log(`Email    : ${demoUser.email}`);
    console.log(`Password : ${demoUser.password}`);
  } finally {
    await pool.end();
  }
}

seedUser().catch((error) => {
  console.error("Failed to seed demo user:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
