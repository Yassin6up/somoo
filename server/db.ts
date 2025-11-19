import pkg from 'pg';
const { Pool } = pkg;

// Fix: Use named import for drizzle
import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from "@shared/schema";

const DATABASE_URL = "postgres://postgres:1234@localhost:5432/smoo";

// Create a Postgres pool
export const pool = new Pool({
  connectionString: DATABASE_URL,
});

// Initialize Drizzle ORM with the pool
export const db = drizzle(pool, {
  schema,
  logger: true, // simplified logger
});