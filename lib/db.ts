import { Pool, type QueryResultRow } from "pg";

export type DatabaseClient = {
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

let pool: Pool | undefined;

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required database configuration: ${name}`);
  return value;
}

export function getDatabase(): DatabaseClient {
  if (!pool) {
    pool = new Pool({
      host: required("DB_HOST"),
      port: Number(process.env.DB_PORT ?? 5432),
      database: required("DB_DATABASE"),
      user: required("DB_USERNAME"),
      password: required("DB_PASSWORD"),
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
}