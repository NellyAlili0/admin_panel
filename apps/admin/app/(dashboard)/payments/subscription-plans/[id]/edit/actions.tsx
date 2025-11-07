"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { database } from "@/database/config";
import { z } from "zod";
import { zfd } from "zod-form-data";

const updateSubscriptionSchema = zfd.formData({
  id: zfd.numeric(),
  school_id: zfd.numeric(),
  name: zfd.text(),
  description: zfd.text().optional(),
  duration_days: zfd.numeric(),
  price: zfd.numeric(),
  is_active: z
    .string()
    .optional()
    .transform((val) => val === "1" || val === "on"),
  commission_amount: zfd.numeric().optional(),
  bank_paybill_number: zfd.text().optional(),
  bank_account_number: zfd.text().optional(),
});

export async function updateSubscriptionPlan(formData: FormData) {
  const parsed = updateSubscriptionSchema.safeParse(formData);

  if (!parsed.success) {
    console.log("Validation errors:", parsed.error.issues);
    throw new Error("Invalid form data");
  }

  const {
    id,
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

  // 1) Check if plan exists
  const existingPlan = await database
    .selectFrom("subscription_plans")
    .select(["id", "school_id"])
    .where("id", "=", id)
    .executeTakeFirst();

  if (!existingPlan) {
    throw new Error("Subscription plan not found");
  }

  // Verify school hasn't changed (extra security)
  if (existingPlan.school_id !== school_id) {
    throw new Error("Cannot change school for existing plan");
  }

  // 2) Get school details for bank updates
  const school = await database
    .selectFrom("school")
    .select(["id", "bank_paybill_number", "bank_account_number"])
    .where("id", "=", school_id)
    .executeTakeFirst();

  if (!school) {
    throw new Error("School not found");
  }

  // 3) Update school bank details only if empty
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

  // 4) Update subscription plan
  await database
    .updateTable("subscription_plans")
    .set({
      name,
      description: description ?? null,
      duration_days,
      price,
      is_active,
      commission_amount: commission_amount ?? 0,
      updated_at: new Date(),
    })
    .where("id", "=", id)
    .execute();

  revalidatePath("/payments/subscription-plans");
  redirect("/payments/subscription-plans");
}
