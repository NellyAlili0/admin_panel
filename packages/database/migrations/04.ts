import type { Kysely } from "kysely";
import { Auth } from "../src/auth"; // adjust path as needed

export async function up(db: Kysely<any>): Promise<void> {
  const auth = new Auth();

  const hashedPassword = auth.hash({ password: "@tesing123" });

  await db
    .insertInto("admin")
    .values({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "Admin",
    })
    .execute();

  console.log("✅ Seeded new admin user: admin@gmail.com");
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom("admin").where("email", "=", "admin@gmail.com").execute();

  console.log("🗑️ Removed seeded admin: admin@gmail.com");
}
