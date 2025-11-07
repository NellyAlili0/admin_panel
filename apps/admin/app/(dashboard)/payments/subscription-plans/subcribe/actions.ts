"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { database } from "@/database/config";
import { z } from "zod";
import { zfd } from "zod-form-data";

const createSubscriptionSchema = zfd.formData({
  school_id: zfd.numeric(),
  name: zfd.text(),
  description: zfd.text().optional(),
  duration_days: zfd.numeric(),
  price: zfd.numeric(),
  is_active: z
    .string()
    .optional()
    .transform((val) => val === "1" || val === "on"), // Handle both "1" and "on"
  commission_amount: zfd.numeric().optional(),
  bank_paybill_number: zfd.text().optional(),
  bank_account_number: zfd.text().optional(),
});

export async function createSubscriptionPlan(formData: FormData) {
  // Debug: log the formData to see what's being sent
  console.log("FormData entries:", Array.from(formData.entries()));

  const parsed = createSubscriptionSchema.safeParse(formData);

  if (!parsed.success) {
    console.log("Validation errors:", parsed.error.issues);
    throw new Error("Invalid form data");
  }

  const {
    school_id,
    name,
    description,
    duration_days,
    price,
    is_active,
    commission_amount,
    bank_paybill_number,
    bank_account_number,
  } = parsed.data;

  // 1) check school
  const school = await database
    .selectFrom("school")
    .select(["id", "bank_paybill_number", "bank_account_number"])
    .where("id", "=", school_id)
    .executeTakeFirst();

  if (!school) {
    throw new Error("School not found");
  }

  // 2) update school bank details only if empty now
  const updates: {
    bank_paybill_number?: string;
    bank_account_number?: string;
  } = {};

  if (
    (!school.bank_paybill_number || school.bank_paybill_number === "") &&
    bank_paybill_number
  ) {
    updates.bank_paybill_number = bank_paybill_number;
  }
  if (
    (!school.bank_account_number || school.bank_account_number === "") &&
    bank_account_number
  ) {
    updates.bank_account_number = bank_account_number;
  }

  if (Object.keys(updates).length > 0) {
    await database
      .updateTable("school")
      .set(updates)
      .where("id", "=", school_id)
      .execute();
  }

  // 3) insert plan
  await database
    .insertInto("subscription_plans")
    .values({
      school_id,
      name,
      description: description ?? null,
      duration_days,
      price,
      is_active, // Now properly transformed to boolean
      commission_amount: commission_amount ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .execute();

  revalidatePath("/payments/subscription-plans");
  redirect("/payments/subscription-plans");
}
