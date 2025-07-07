import type { Kysely } from "kysely";

console.log("Starting migration: add onboarding fields");

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("onboarding")
    .addColumn("pickup", "text")
    .addColumn("dropoff", "text")
    .addColumn("start_date", "date")
    .addColumn("mid_term", "date")
    .addColumn("end_date", "date")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("onboarding")
    .dropColumn("pickup")
    .dropColumn("dropoff")
    .dropColumn("start_date")
    .dropColumn("mid_term")
    .dropColumn("end_date")
    .execute();
}
