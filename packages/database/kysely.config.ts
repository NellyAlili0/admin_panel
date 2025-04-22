import { defineConfig } from "kysely-ctl";
import { db } from "./src/index.ts";


export default defineConfig({
    // ...
    kysely: db,
    // ...
});