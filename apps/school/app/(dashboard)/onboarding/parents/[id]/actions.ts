"use server";

import { database } from "@/database/config";
import { zfd } from "zod-form-data";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function editParent(prevState: any, formData: FormData) {
  try {
    const data = zfd
      .formData({
        parent_id: zfd.text(),
        name: zfd.text(),
        email: zfd.text(),
        phone_number: zfd.text(),
      })
      .safeParse(formData);

    if (!data.success) {
      return { message: "Invalid data provided", success: false };
    }

    const { parent_id, name, email, phone_number } = data.data;

    await database
      .updateTable("user")
      .set({
        name: name,
        email: email,
        phone_number: phone_number,
      })
      .where("id", "=", Number(parent_id))
      .where("kind", "=", "Parent")
      .executeTakeFirst();

    revalidatePath("/drivers/" + email);

    return { message: "Parent updated successfully", success: true };
  } catch (error) {
    console.error("Error updating parent:", error);
    return { message: "Failed to update parent", success: false };
  }
}

const addStudentSchema = zfd.formData({
  first_name: zfd.text(),
  last_name: zfd.text(),
  customer_id: zfd.text(),
  gender: zfd.text(),
  dob: zfd.text(),
  wallet_id: zfd.text(),
});

export async function addStudent(prevState: any, formData: FormData) {
  try {
    const data = addStudentSchema.safeParse(formData);

    if (!data.success) {
      console.error("Data parse failed:", data.error.flatten());
      return {
        message: "Invalid or missing fields. Please check all required fields.",
        success: false,
      };
    }

    const { first_name, last_name, customer_id, wallet_id, gender, dob } =
      data.data;

    // Validate that required fields are not empty
    if (
      !first_name ||
      !last_name ||
      !customer_id ||
      !wallet_id ||
      !gender ||
      !dob
    ) {
      return {
        message: "All fields are required",
        success: false,
      };
    }

    const cookieStore = await cookies();
    const id = cookieStore.get("school_id")?.value;
    const school_id = Number(id);

    if (!school_id) {
      return {
        message: "School ID not found. Please log in again.",
        success: false,
      };
    }

    const schoolInfo = await database
      .selectFrom("school")
      .select([
        "school.id",
        "school.name",
        "school.terra_email",
        "school.terra_password",
        "school.terra_tag_id",
        "school.terra_student_tag", // ✅ Fetch the student tag
      ])
      .where("school.id", "=", school_id)
      .executeTakeFirst();

    if (
      !(
        schoolInfo?.terra_email &&
        schoolInfo.terra_password &&
        schoolInfo.terra_tag_id &&
        schoolInfo.terra_student_tag // ✅ Ensure student tag exists
      )
    ) {
      return {
        message: "Missing school credentials or tags. Please contact support.",
        success: false,
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/smartcards/dependants/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: schoolInfo.terra_email,
        password: schoolInfo.terra_password,
        body: {
          first_name,
          last_name,
          customer_id,
          wallet_id,
          status: "Active",
          dob,
          gender,
          tags: [schoolInfo.terra_student_tag], // ✅ Updated: Uses dynamic student tag
        },
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("Student creation failed:", result);
      return {
        message: result.error || "Failed to create student. Please try again.",
        success: false,
      };
    }

    revalidatePath("/parents");

    return {
      message: "Student created successfully!",
      success: true,
    };
  } catch (error: any) {
    console.error("Error creating student:", error);
    return {
      message:
        error.message || "An unexpected error occurred. Please try again.",
      success: false,
    };
  }
}
