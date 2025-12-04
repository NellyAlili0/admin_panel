"use server";

import { zfd } from "zod-form-data";
import { database } from "@/database/config";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const editStudentSchema = zfd.formData({
  student_id: zfd.numeric(),
  parent_id: zfd.numeric(),
  name: zfd.text(),
  gender: zfd.text(),
  address: zfd.text(z.string().optional()),
  service_type: zfd.text(z.string().optional()),
  daily_fee: zfd.text(z.string().optional()),
  transport_term_fee: zfd.text(z.string().optional()),
  school_id: zfd.text(z.string().optional()),
});

export async function editStudent(prevState: any, formData: FormData) {
  const data = editStudentSchema.safeParse(formData);

  if (!data.success) {
    console.error("Validation errors:", data.error.flatten());
    return { message: "Invalid data provided" };
  }

  const {
    student_id,
    parent_id,
    name,
    gender,
    address,
    service_type,
    daily_fee,
    transport_term_fee,
    school_id,
  } = data.data;

  try {
    // Convert string values to numbers where needed
    const dailyFeeNum = daily_fee ? parseFloat(daily_fee) : null;
    const transportTermFeeNum = transport_term_fee
      ? parseFloat(transport_term_fee)
      : null;
    const schoolIdNum = school_id ? parseInt(school_id, 10) : null;

    // Update the student record using Kysely syntax
    await database
      .updateTable("student")
      .set({
        name,
        gender: gender as "Male" | "Female",
        address: address || null,
        service_type: service_type as "school" | "carpool" | "private" | null,
        daily_fee: dailyFeeNum,
        transport_term_fee: transportTermFeeNum,
        schoolId: schoolIdNum,
      })
      .where("id", "=", student_id)
      .execute();

    // Revalidate the parent page to show updated data
    revalidatePath(`/parents/${parent_id}`);

    return { message: "Student updated successfully" };
  } catch (error) {
    console.error("Error updating student:", error);
    return { message: "Failed to update student. Please try again." };
  }
}

const createSubscriptionSchema = zfd.formData({
  student_id: zfd.numeric(),
  start_date: zfd.text(z.string().min(1, "Start date is required")),
  expiry_date: zfd.text(z.string().min(1, "Expiry date is required")),
});

export async function createSubscription(prevState: any, formData: FormData) {
  const data = createSubscriptionSchema.safeParse(formData);

  if (!data.success) {
    console.error("Validation errors:", data.error.flatten());
    return { message: "Invalid data provided" };
  }

  const { student_id, start_date, expiry_date } = data.data;

  try {
    // Check if subscription already exists for this student
    const existingSubscription = await database
      .selectFrom("subscriptions")
      .select("id")
      .where("student_id", "=", student_id)
      .executeTakeFirst();

    if (existingSubscription) {
      return { message: "Subscription already exists for this student" };
    }

    // Convert dates from YYYY-MM-DD to proper Date objects
    const startDateObj = new Date(start_date);
    const expiryDateObj = new Date(expiry_date);

    // Determine status based on expiry date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDateObj.setHours(0, 0, 0, 0);

    const status = expiryDateObj >= today ? "active" : "inactive";

    // Create the subscription record
    await database
      .insertInto("subscriptions")
      .values({
        student_id,
        start_date: startDateObj,
        expiry_date: expiryDateObj,
        status,
        total_paid: 0,
        balance: 0,
        is_commission_paid: false,
      })
      .execute();

    // Revalidate the subscriptions page
    revalidatePath("/payments/subscriptions");

    return { message: "Subscription created successfully" };
  } catch (error) {
    console.error("Error creating subscription:", error);
    return { message: "Failed to create subscription. Please try again." };
  }
}
