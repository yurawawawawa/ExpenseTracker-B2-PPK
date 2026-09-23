import { Pool, type QueryResultRow } from "pg";

export type DatabaseClient = {
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

let pool: Pool | undefined;

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required database configuration: ${name}`);
  }
  return value;
}

export function getDatabase(): DatabaseClient {
  if (!pool) {
    pool = new Pool({
      host: getRequiredEnv("DB_HOST"),
      port: Number(process.env.DB_PORT ?? 5432),
      database: getRequiredEnv("DB_DATABASE"),
      user: getRequiredEnv("DB_USERNAME"),
      password: getRequiredEnv("DB_PASSWORD"),
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });
  }

  return pool;
}