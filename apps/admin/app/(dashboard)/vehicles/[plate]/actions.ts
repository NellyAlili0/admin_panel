"use server"

import { db } from "@repo/database";
import { Notify } from "@repo/handlers/notify";
import { revalidatePath } from "next/cache";
import { zfd } from "zod-form-data";

const markAsInspectedSchema = zfd.formData({
    plate: zfd.text(),
})
export async function markAsInspected(prevState: any, formData: FormData) {
    const validatedFields = markAsInspectedSchema.safeParse(formData);
    if (!validatedFields.success) {
        return {
            message: "Invalid Data Submitted",
        };
    }
    const { plate } = validatedFields.data;
    await db.updateTable("vehicle")
        .set({ is_inspected: true })
        .where("registration_number", "=", plate)
        .execute();
    // find driveremail and send notification
    const driver = await db.selectFrom("user")
        .leftJoin('vehicle', 'user.id', 'vehicle.user_id')
        .select(['user.email', 'user.id'])
        .where('vehicle.registration_number', '=', plate)
        .executeTakeFirst();
    if (driver) {
        await db.insertInto('notification')
            .values({
                user_id: driver.id!,
                title: "Vehicle Inspected",
                message: "Your vehicle has been inspected and approved",
                kind: "Personal",
                section: "Profile",
                is_read: false,
            })
            .execute();
        let notify = new Notify()
        await notify.sendSingle({
            title: "Vehicle Inspected",
            message: "Your vehicle has been inspected and approved",
            email: driver.email
        })
    }
    revalidatePath(`/vehicles/${plate}`);
    return {
        message: "Vehicle marked as inspected",
    };
}