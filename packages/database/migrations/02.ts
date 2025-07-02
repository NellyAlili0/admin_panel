import type { Kysely } from "kysely";

console.log("Starting migration 02");

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("school").addColumn("url", "text").execute();

  // await db.schema
  //   .createIndex("unique_school_url")
  //   .on("school")
  //   .column("url")
  //   .unique()
  //   .execute();

  await db.schema
    .createTable("onboarding")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("parent_name", "text", (col) => col.notNull())
    .addColumn("parent_email", "text")
    .addColumn("parent_phone", "text")
    .addColumn("address", "text")
    .addColumn("student_name", "text", (col) => col.notNull())
    .addColumn("student_gender", "varchar(6)", (col) => col.notNull()) // "Male" | "Female"
    .addColumn("school_id", "integer", (col) =>
      col.notNull().references("school.id")
    )
    .addColumn("ride_type", "varchar(20)", (col) =>
      col.notNull().defaultTo("pickup & dropoff")
    )
    .addColumn("created_at", "timestamp", (col) => col.defaultTo("now()"))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the onboarding table
  await db.schema.dropTable("onboarding").execute();
}
