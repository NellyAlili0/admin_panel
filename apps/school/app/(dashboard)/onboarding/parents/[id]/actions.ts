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

    const auth = new Auth();
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

const sendNotificationSchema = zfd.formData({
  parent_id: zfd.text(),
  title: zfd.text(),
  body: zfd.text(),
});

export async function sendNotification(prevState: any, formData: FormData) {
  const data = sendNotificationSchema.safeParse(formData);
  if (!data.success) {
    return { message: "Invalid data" };
  }
  const { parent_id, title, body } = data.data;

  // Fetch parent email
  const parent = await database
    .selectFrom("user")
    .select(["email"])
    .where("id", "=", Number(parent_id))
    .executeTakeFirst();

  if (!parent || !parent.email) {
    return { message: "Parent not found or no email provided" };
  }

  try {
    revalidatePath(`/parents/${parent.email}`);
    return { message: "Notification sent successfully" };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { message: "Failed to send notification. Please try again." };
  }
}

const addStudentSchema = zfd.formData({
  parent_id: zfd.text(),
  name: zfd.text(),
  gender: zfd.text(),
  address: zfd.text(),
  comments: zfd.text(),
});

export async function addStudent(prevState: any, formData: FormData) {
  const data = addStudentSchema.safeParse(formData);
  if (!data.success) {
    return { message: "Invalid data" };
  }
  const { parent_id, name, gender, address, comments } = data.data;

  // Fetch parent email
  const parent = await database
    .selectFrom("user")
    .select(["email"])
    .where("id", "=", Number(parent_id))
    .executeTakeFirst();

  if (!parent || !parent.email) {
    return { message: "Parent not found or no email provided" };
  }

  try {
    await database
      .insertInto("student")
      .values({
        name,
        gender: gender as "Male" | "Female",
        address: address || null,
        comments: comments || null,
        parentId: Number(parent_id),
        meta: null,
        created_at: new Date(),
        profile_picture: null, // Optional field
        schoolId: null, // Optional field
      })
      .executeTakeFirst();

    await database
      .insertInto("notification")
      .values({
        userId: Number(parent_id),
        title: "New Student Added",
        message: `A new student ${name} has been added to your account`,
        is_read: false,
        kind: "Personal" as const,
        section: "Other" as const,
        meta: null,
        created_at: new Date(),
      })
      .executeTakeFirst();

    revalidatePath(`/parents/${parent.email}`);
    return { message: "Student added successfully" };
  } catch (error) {
    console.error("Error adding student:", error);
    return { message: "Failed to add student. Please try again." };
  }
}
