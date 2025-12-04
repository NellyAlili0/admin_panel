"use server";

import { zfd } from "zod-form-data";
import { database } from "@/database/config";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const editSubscriptionSchema = zfd.formData({
  subscription_id: zfd.numeric(),
  total_paid: zfd.numeric(),
  expiry_date: zfd.text(z.string().min(1, "Expiry date is required")),
});

export async function editSubscription(prevState: any, formData: FormData) {
  const data = editSubscriptionSchema.safeParse(formData);

  if (!data.success) {
    console.error("Validation errors:", data.error.flatten());
    return { message: "Invalid data provided" };
  }

  const { subscription_id, total_paid, expiry_date } = data.data;

  try {
    // Convert date from YYYY-MM-DD to a proper Date object
    const expiryDateObj = new Date(expiry_date);

    // Update subscription status based on expiry date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDateObj.setHours(0, 0, 0, 0);

    const status = expiryDateObj >= today ? "active" : "inactive";

    // Update the subscription record
    await database
      .updateTable("subscriptions")
      .set({
        total_paid,
        expiry_date: expiryDateObj,
        status,
      })
      .where("id", "=", subscription_id)
      .execute();

    // Revalidate the subscriptions page
    revalidatePath("/payments/subscriptions");

    return { message: "Subscription updated successfully" };
  } catch (error) {
    console.error("Error updating subscription:", error);
    return { message: "Failed to update subscription. Please try again." };
  }
}
