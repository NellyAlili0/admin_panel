"use server"

import { db } from "@repo/database";
import { zfd } from "zod-form-data";
import { Auth } from "@repo/handlers/auth";
import { revalidatePath } from "next/cache";
import { Notify } from "@repo/handlers/notify";

const createParentSchema = zfd.formData({
    name: zfd.text(),
    email: zfd.text(),
    phone_number: zfd.text(),
    password: zfd.text(),
})
export async function createParent(prevState: any, formData: FormData) {
    const data = createParentSchema.safeParse(formData)
    if (!data.success) {
        return { message: "Invalid data" }
    }
    const { name, email, phone_number, password } = data.data
    let auth = new Auth()
    const hash = await auth.hash({ password: password })
    await db
        .insertInto("user")
        .values({
            name,
            email,
            phone_number,
            password: hash,
            kind: "Parent",
            status: "Active",
            wallet_balance: 0,
            is_kyc_verified: true,
        })
        .executeTakeFirst();
    revalidatePath("/parents");
    return { message: "Parent created successfully" }
}

const sendNotificationSchema = zfd.formData({
    parent_id: zfd.text(),
    title: zfd.text(),
    body: zfd.text(),
})
export async function sendNotification(prevState: any, formData: FormData) {
    const data = sendNotificationSchema.safeParse(formData)
    if (!data.success) {
        return { message: "Invalid data" }
    }
    const { parent_id, title, body } = data.data
    // email of parent
    const parent = await db.selectFrom("user").select(["email"]).where("id", "=", Number(parent_id)).executeTakeFirst()
    if (!parent) {
        return { message: "Parent not found" }
    }
    let notify = new Notify()
    await notify.sendSingle({
        title,
        message: body,
        email: parent.email
    })
    await db
        .insertInto("notification")
        .values({
            user_id: Number(parent_id),
            title,
            message: body,
            is_read: false,
            kind: "Personal",
            section: "Other",
        })
        .executeTakeFirst();
    revalidatePath("/parents");
    return { message: "Notification sent successfully" }
}

const addStudentSchema = zfd.formData({
    parent_id: zfd.text(),
    name: zfd.text(),
    gender: zfd.text(),
    address: zfd.text(),
    comments: zfd.text(),
})
export async function addStudent(prevState: any, formData: FormData) {
    const data = addStudentSchema.safeParse(formData)
    if (!data.success) {
        return { message: "Invalid data" }
    }
    const { parent_id, name, gender, address, comments } = data.data
    // get parent email
    const parent = await db.selectFrom("user").select(["email"]).where("id", "=", Number(parent_id)).executeTakeFirst()
    if (!parent) {
        return { message: "Parent not found" }
    }
    let notify = new Notify()
    await notify.sendSingle({
        title: "New Student Added",
        message: `A new student ${name} has been added to your account`,
        email: parent.email
    })
    await db
        .insertInto("student")
        .values({
            name,
            gender: gender as "Male" | "Female",
            address,
            comments,
            parent_id: Number(parent_id),
        })
        .executeTakeFirst();
    await db
        .insertInto("notification")
        .values({
            user_id: Number(parent_id),
            title: "New Student Added",
            message: `A new student ${name} has been added to your account`,
            is_read: false,
            kind: "Personal",
            section: "Other",
        })
        .executeTakeFirst();
    revalidatePath(`/parents/${parent.email}`);
    return { message: "Student added successfully" }
}

const linkSchoolSchema = zfd.formData({
    student_id: zfd.text(),
    school_id: zfd.text(),
})
export async function linkSchool(prevState: any, formData: FormData) {
    const data = linkSchoolSchema.safeParse(formData)
    if (!data.success) {
        return { message: "Invalid data" }
    }
    const { student_id, school_id } = data.data
    await db
        .updateTable("student")
        .set({ school_id: Number(school_id) })
        .where("id", "=", Number(student_id))
        .executeTakeFirst();
    revalidatePath(`/parents/students/${student_id}`);
    return { message: "School linked successfully" }
}
