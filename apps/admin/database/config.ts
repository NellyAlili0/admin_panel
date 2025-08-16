import { Database } from "./schema";
import pkg from "pg";
const { Pool } = pkg;
import { Kysely, PostgresDialect, sql } from "kysely";

const pool =
  process.env.ENVIRON === "local"
    ? new Pool({
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        port: parseInt(process.env.DB_PORT!),
        ssl: false,
        max: 10,
      })
    : new Pool({
        connectionString: process.env.DATABASE_URL, // Render gives you this
        ssl: {
          rejectUnauthorized: false, // needed for most managed services
        },
        max: 10,
      });

const dialect = new PostgresDialect({
  pool,
});

export const database = new Kysely<Database>({
  dialect,
});

export { sql };
