"use server";

import { zfd } from "zod-form-data";
import { z } from "zod";
import { database } from "@/database/config";
import { revalidatePath } from "next/cache";
import { Auth } from "@/Authentication";

// Define form schema
const createSchoolCredentials = zfd.formData(
  z.object({
    name: zfd.text(z.string().min(1, "Name is required")),
    phone_number: zfd.text(z.string().min(1, "Phone number is required")),
    school_id: zfd.text(),
    password: zfd.text(
      z.string().min(4, "Password must be at least 4 characters")
    ),
    email: zfd.text(
      z.string().email("Invalid email address").min(1, "Email is required")
    ),
  })
);

// Define return type for the action
interface ActionResponse {
  message?: string;
  id?: number;
}

export async function createCredentials(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const data = createSchoolCredentials.safeParse(formData);
  if (!data.success) {
    return {
      message:
        "Invalid data submitted: " +
        data.error.issues.map((issue) => issue.message).join(", "),
    };
  }

  const { name, email, phone_number, school_id, password } = data.data;
  const auth = new Auth();
  const hash = await auth.hash({ password });

  try {
    await database
      .insertInto("user")
      .values({
        name,
        email,
        phone_number,
        school_id: Number(school_id),
        password: hash,
        provider: "email", // Required field as per schema
        kind: "School" as const,
        statusId: 1, // Assuming 'Active' is mapped to statusId 1
        wallet_balance: 0,
        is_kyc_verified: true,
        meta: null,
        created_at: new Date(),
        updated_at: new Date(),
        socialId: null, // Optional field, setting to null as it's not used
        firstName: null, // Optional field
        lastName: null, // Optional field
        roleId: 5, // Optional field
        deleted_at: null, // Optional field
        photo: null,
      })
      .executeTakeFirst();

    revalidatePath("/schools");
    // server action
    return { id: Number(school_id) };
  } catch (error) {
    return {
      message:
        "Error creating school: " +
        (error instanceof Error ? error.message : "Unknown error"),
    };
  }
}
