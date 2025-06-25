import type { Kysely } from "kysely";
import { Auth } from "../src/auth";

console.log("Starting migration 01");

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("user")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("name", "text")
    .addColumn("email", "text")
    .addColumn("password", "text")
    .addColumn("phone_number", "text")
    .addColumn("kind", "text")
    .addColumn("meta", "json")
    .addColumn("wallet_balance", "decimal")
    .addColumn("is_kyc_verified", "boolean", (col) => col.defaultTo(false))
    .addColumn("created_at", "timestamp", (col) => col.defaultTo("now()"))
    .addColumn("updated_at", "timestamp", (col) => col.defaultTo("now()"))
    .addColumn("status", "text")
    .execute();

  await db.schema
    .createTable("kyc")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("user_id", "integer", (col) => col.references("user.id"))
    .addColumn("national_id_front", "text")
    .addColumn("national_id_back", "text")
    .addColumn("passport_photo", "text")
    .addColumn("driving_license", "text")
    .addColumn("certificate_of_good_conduct", "text")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo("now()"))
    .addColumn("updated_at", "timestamp", (col) => col.defaultTo("now()"))
    .addColumn("comments", "text")
    .addColumn("is_verified", "boolean", (col) => col.defaultTo(false))
    .execute();

  await db.schema
    .createTable("admin")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("name", "text")
    .addColumn("email", "text")
    .addColumn("password", "text")
    .addColumn("role", "text")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo("now()"))
    .execute();

  await db.schema
    .createTable("school")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("name", "text")
    .addColumn("location", "text")
    .addColumn("comments", "text")
    .addColumn("meta", "json")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo("now()"))
    .execute();

  await db.schema
    .createTable("student")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("school_id", "integer")
    .addColumn("parent_id", "integer")
    .addColumn("name", "text")
    .addColumn("profile_picture", "text")
    .addColumn("gender", "text")
    .addColumn("address", "text")
    .addColumn("comments", "text")
    .addColumn("meta", "json")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo("now()"))
    .execute();

  await db.schema
    .createTable("vehicle")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("user_id", "integer", (col) => col.references("user.id"))
    .addColumn("vehicle_name", "text")
    .addColumn("registration_number", "text")
    .addColumn("vehicle_type", "text")
    .addColumn("vehicle_model", "text")
    .addColumn("vehicle_year", "integer")
    .addColumn("vehicle_image_url", "text")
    .addColumn("seat_count", "integer")
    .addColumn("available_seats", "integer", (col) => col.defaultTo(0))
    .addColumn("is_inspected", "boolean", (col) => col.defaultTo(false))
    .addColumn("comments", "text")
    .addColumn("meta", "json")
    .addColumn("vehicle_registration", "text")
    .addColumn("insurance_certificate", "text")
    .addColumn("vehicle_data", "json")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo("now()"))
    .addColumn("updated_at", "timestamp", (col) => col.defaultTo("now()"))
    .addColumn("status", "text")
    .execute();

  await db.schema
    .createTable("ride")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("vehicle_id", "integer", (col) => col.references("vehicle.id"))
    .addColumn("driver_id", "integer", (col) => col.references("user.id"))
    .addColumn("school_id", "integer", (col) => col.references("school.id"))
    .addColumn("student_id", "integer", (col) => col.references("student.id"))
    .addColumn("parent_id", "integer", (col) => col.references("user.id"))
    .addColumn("schedule", "json")
    .addColumn("comments", "text")
    .addColumn("admin_comments", "text")
    .addColumn("meta", "json")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo("now()"))
    .addColumn("updated_at", "timestamp", (col) => col.defaultTo("now()"))
    .addColumn("status", "text")
    .execute();

  await db.schema
    .createTable("daily_ride")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("ride_id", "integer", (col) => col.references("ride.id"))
    .addColumn("vehicle_id", "integer", (col) => col.references("vehicle.id"))
    .addColumn("driver_id", "integer", (col) => col.references("user.id"))
    .addColumn("kind", "text")
    .addColumn("date", "date")
    .addColumn("start_time", "timestamp", (col) => col.defaultTo("now()"))
    .addColumn("end_time", "timestamp", (col) => col.defaultTo("now()"))
    .addColumn("comments", "text")
    .addColumn("meta", "json")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo("now()"))
    .addColumn("updated_at", "timestamp", (col) => col.defaultTo("now()"))
    .addColumn("status", "text")
    .execute();

  await db.schema
    .createTable("location")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("daily_ride_id", "integer", (col) =>
      col.references("daily_ride.id")
    )
    .addColumn("latitude", "text")
    .addColumn("longitude", "text")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo("now()"))
    .execute();

  await db.schema
    .createTable("payment")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("user_id", "integer", (col) => col.references("user.id"))
    .addColumn("amount", "decimal")
    .addColumn("kind", "text")
    .addColumn("transaction_type", "text")
    .addColumn("comments", "text")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo("now()"))
    .addColumn("updated_at", "timestamp", (col) => col.defaultTo("now()"))
    .execute();

  await db.schema
    .createTable("notification")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("user_id", "integer", (col) => col.references("user.id"))
    .addColumn("title", "text")
    .addColumn("message", "text")
    .addColumn("meta", "json")
    .addColumn("is_read", "boolean", (col) => col.defaultTo(false))
    .addColumn("kind", "text")
    .addColumn("section", "text")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo("now()"))
    .execute();

  // tables to seed,
  const auth = new Auth();
  const password = auth.hash({ password: "nelly02@zid2024" });
  await db
    .insertInto("admin")
    .values({
      name: "Nelly",
      email: "nelly@zidallie.co.ke",
      password: password,
      role: "Admin",
    })
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("user").cascade().execute();
  await db.schema.dropTable("kyc").cascade().execute();
  await db.schema.dropTable("admin").cascade().execute();
  await db.schema.dropTable("school").cascade().execute();
  await db.schema.dropTable("student").cascade().execute();
  await db.schema.dropTable("vehicle").cascade().execute();
  await db.schema.dropTable("ride").cascade().execute();
  await db.schema.dropTable("daily_ride").cascade().execute();
  await db.schema.dropTable("location").cascade().execute();
  await db.schema.dropTable("payment").cascade().execute();
  await db.schema.dropTable("notification").cascade().execute();
}
