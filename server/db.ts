import pkg from 'pg';
const { Pool } = pkg;

// Fix: Use named import for drizzle
import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from "@shared/schema";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_P90xwNCOUqBA@ep-nameless-pond-ahtlko8p.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create a Postgres pool
export const pool = new Pool({
  connectionString: DATABASE_URL,
});

// Initialize Drizzle ORM with the pool
export const db = drizzle(pool, {
  schema,
  logger: true, // simplified logger
});
