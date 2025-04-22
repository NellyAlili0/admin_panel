import { Database } from './schema' // this is the Database interface we defined earlier
// import { Pool } from 'pg'
import pkg from 'pg';
const { Pool } = pkg;
import { Kysely, PostgresDialect, sql } from 'kysely'

const dialect = new PostgresDialect({
    pool: new Pool({
        database: process.env.ENVIRON === 'local' ? process.env.DB_NAME : process.env.DB_PROD_NAME,
        host: process.env.ENVIRON === 'local' ? process.env.DB_HOST : process.env.DB_PROD_HOST,
        user: process.env.ENVIRON === 'local' ? process.env.DB_USER : process.env.DB_PROD_USER,
        password: process.env.ENVIRON === 'local' ? process.env.DB_PASS : process.env.DB_PROD_PASS,
        port: parseInt(process.env.ENVIRON === 'local' ? process.env.DB_PORT! : process.env.DB_PROD_PORT!),
        ssl: process.env.ENVIRON === 'local' ? false : true,
        max: 10,
    })
})

// Database interface is passed to Kysely's constructor, and from now on, Kysely 
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how 
// to communicate with your database.
export const db = new Kysely<Database>({
    dialect,
})

export { sql }