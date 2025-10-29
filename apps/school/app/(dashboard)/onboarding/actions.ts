"use server";

import { database } from "@/database/config";
import { revalidatePath } from "next/cache";
import { zfd } from "zod-form-data";
import { cookies } from "next/headers";

const addParentSchema = zfd.formData({
  first_name: zfd.text(),
  last_name: zfd.text(),
  email: zfd.text(),
  phone: zfd.text(),
  national_id: zfd.text(),
  dob: zfd.text(),
  gender: zfd.text(),
});

export async function addParent(prevState: any, formData: FormData) {
  const data = addParentSchema.safeParse(formData);
  if (!data.success) {
    return { success: false, message: "Invalid or missing fields." };
  }

  const { first_name, last_name, email, phone, national_id, dob, gender } =
    data.data;

  const cookieStore = await cookies();
  const id = cookieStore.get("school_id")?.value;
  const school_id = Number(id);

  if (!school_id) {
    return { success: false, message: "Missing school ID in cookies." };
  }

  const schoolInfo = await database
    .selectFrom("school")
    .select([
      "school.id",
      "school.name",
      "school.terra_email",
      "school.terra_password",
      "school.terra_tag_id",
    ])
    .where("school.id", "=", school_id)
    .executeTakeFirst();

  if (
    !(
      schoolInfo?.terra_email &&
      schoolInfo.terra_password &&
      schoolInfo.terra_tag_id
    )
  ) {
    return {
      success: false,
      message: "Terra credentials missing (email, password, tag).",
    };
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";

    const res = await fetch(`${baseUrl}/api/smartcards/accounts/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: schoolInfo.terra_email,
        password: schoolInfo.terra_password,
        body: {
          first_name,
          last_name,
          email,
          phone,
          national_id,
          dob,
          gender,
          group_id: "a4d08acb-8395-413f-ab5d-7d35e111c039",
          tags: ["985f584c-0c10-482f-ac6e-46ce3c376930"],
        },
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("Parent creation failed:", result);
      return {
        success: false,
        message: result.error || "Failed to create parent.",
      };
    }

    await revalidatePath("/parents");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating parent:", error);
    return {
      success: false,
      message: error.message || "Unexpected error occurred.",
    };
  }
}
