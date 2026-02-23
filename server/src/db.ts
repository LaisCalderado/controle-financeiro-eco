// src/db.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
const isRemoteDatabase =
  !!databaseUrl &&
  !databaseUrl.includes('localhost') &&
  !databaseUrl.includes('127.0.0.1');

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: isRemoteDatabase
    ? {
        rejectUnauthorized: false
      }
    : undefined
});
