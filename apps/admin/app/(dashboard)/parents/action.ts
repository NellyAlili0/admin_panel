"use server";

import { zfd } from "zod-form-data";
import { database } from "@/database/config";
import { Auth } from "@/Authentication/index";
import { revalidatePath } from "next/cache";
import { Notify } from "@repo/handlers/notify";

const createParentSchema = zfd.formData({
  name: zfd.text(),
  email: zfd.text(),
  phone_number: zfd.text(),
  password: zfd.text(),
});

export async function createParent(prevState: any, formData: FormData) {
  const data = createParentSchema.safeParse(formData);
  if (!data.success) {
    return { message: "Invalid data" };
  }
  const { name, email, phone_number, password } = data.data;
  const auth = new Auth();
  const hash = await auth.hash({ password });

  try {
    // Insert parent user with required provider field
    await database
      .insertInto("user")
      .values({
        name,
        email,
        phone_number,
        password: hash,
        provider: "email", // Required field as per schema
        kind: "Parent" as const,
        statusId: 1, // Assuming 'Active' is mapped to statusId 1
        wallet_balance: 0,
        is_kyc_verified: true,
        meta: null,
        created_at: new Date(),
        updated_at: new Date(),
        socialId: null, // Optional field, setting to null as it's not used
        firstName: null, // Optional field
        lastName: null, // Optional field
        roleId: 4, // Optional field
        deleted_at: null, // Optional field
        photo: null,
      })
      .executeTakeFirst();

    revalidatePath(`/parents/${email}`);
    return { message: "Parent created successfully" };
  } catch (error) {
    console.error("Error creating parent:", error);
    return { message: "Failed to create parent. Please try again." };
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
    const notify = new Notify();
    await notify.sendSingle({
      title,
      message: body,
      email: parent.email,
    });

    await database
      .insertInto("notification")
      .values({
        userId: Number(parent_id),
        title,
        message: body,
        is_read: false,
        kind: "Personal" as const,
        section: "Other" as const,
        meta: null,
        created_at: new Date(),
      })
      .executeTakeFirst();

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
    const notify = new Notify();
    await notify.sendSingle({
      title: "New Student Added",
      message: `A new student ${name} has been added to your account`,
      email: parent.email,
    });

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

const linkSchoolSchema = zfd.formData({
  student_id: zfd.text(),
  school_id: zfd.text(),
});

export async function linkSchool(prevState: any, formData: FormData) {
  const data = linkSchoolSchema.safeParse(formData);
  if (!data.success) {
    return { message: "Invalid data" };
  }
  const { student_id, school_id } = data.data;

  try {
    await database
      .updateTable("student")
      .set({ schoolId: Number(school_id) })
      .where("id", "=", Number(student_id))
      .executeTakeFirst();

    revalidatePath(`/parents/students/${student_id}`);
    return { message: "School linked successfully" };
  } catch (error) {
    console.error("Error linking school:", error);
    return { message: "Failed to link school. Please try again." };
  }
}
