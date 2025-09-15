import { Database } from "./schema";
import pkg from "pg";
const { Pool } = pkg;
import { Kysely, PostgresDialect, sql } from "kysely";

const pool = new Pool({
  connectionString:
    "postgresql://zidallie_database_user:9NK93fFFDXCeYsFJCRWZjV9dGfFmU1jd@dpg-d2aql8juibrs73euhjj0-a.oregon-postgres.render.com/zidallie_database",
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
