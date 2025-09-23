"use server";

import { Auth } from "@/Authentication";
import { database } from "@/database/config";
import { zfd } from "zod-form-data";
import { revalidatePath } from "next/cache";

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

    // Revalidate both old and new email paths in case email changed
    revalidatePath("/drivers/" + email);

    return { message: "Driver updated successfully", success: true };
  } catch (error) {
    console.error("Error updating driver:", error);
    return { message: "Failed to update driver", success: false };
  }
}

export async function changePassword(prevState: any, formData: FormData) {
  try {
    const data = zfd
      .formData({
        parent_id: zfd.text(),
        password: zfd.text(),
      })
      .safeParse(formData);

    if (!data.success) {
      return { message: "Invalid data provided", success: false };
    }

    const { parent_id, password } = data.data;

    if (password.length < 4) {
      return {
        message: "Password must be at least 4 characters long",
        success: false,
      };
    }

    let auth = new Auth();
    const hash = await auth.hash({ password: password });

    await database
      .updateTable("user")
      .set({
        password: hash,
      })
      .where("id", "=", Number(parent_id))
      .where("kind", "=", "Parent")
      .executeTakeFirst();

    return { message: "Password changed successfully", success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return { message: "Failed to change password", success: false };
  }
}
