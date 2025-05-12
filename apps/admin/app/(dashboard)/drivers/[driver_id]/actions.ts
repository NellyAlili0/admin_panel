"use server"

import { db } from "@repo/database";
import { revalidatePath } from "next/cache";
import { zfd } from "zod-form-data";
import { Notify } from "@repo/handlers/notify";
import { redirect } from "next/navigation";

const markVerifiedSchema = zfd.formData({
    driver_id: zfd.text(),
})

// mark driver as verified
export async function markVerified(prevState: any, formData: FormData) {
    const data = markVerifiedSchema.safeParse(formData)
    if (!data.success) {
        return { message: "Invalid driver id" }
    }
    const { driver_id } = data.data
    await db
        .updateTable("user")
        .set({ is_kyc_verified: true })
        .where("id", "=", Number(driver_id))
        .execute();

    // find driver email and send notification
    const driver = await db.selectFrom("user")
        .select(["user.email"])
        .where("user.id", "=", Number(driver_id))
        .executeTakeFirst();
    if (driver) {
        let notify = new Notify()
        await notify.sendSingle({
            title: "KYC Verified",
            message: "Your KYC has been verified",
            email: driver.email
        })
    }
    revalidatePath("/drivers/" + driver?.email)
    return { message: "Driver marked as verified", success: true }
}


// add vehicle
const addVehicleSchema = zfd.formData({
    driver_id: zfd.text(),
    vehicle_name: zfd.text(),
    registration_number: zfd.text(),
    vehicle_type: zfd.text(),
    vehicle_model: zfd.text(),
    vehicle_year: zfd.text(),
    seat_count: zfd.text(),
    is_inspected: zfd.text(),
    comments: zfd.text(),
})
export async function addVehicle(prevState: any, formData: FormData) {
    const data = addVehicleSchema.safeParse(formData)
    if (!data.success) {
        return { message: "Invalid data" }
    }
    const { driver_id, vehicle_name, registration_number, vehicle_type, vehicle_model, vehicle_year, seat_count, is_inspected, comments } = data.data
    await db
        .insertInto("vehicle")
        .values({
            user_id: Number(driver_id),
            vehicle_name: vehicle_name,
            registration_number: registration_number,
            vehicle_type: vehicle_type as "Bus" | "Van" | "Car",
            vehicle_model: vehicle_model,
            vehicle_year: Number(vehicle_year),
            seat_count: Number(seat_count),
            available_seats: Number(seat_count),
            is_inspected: is_inspected === "true",
            comments: comments,
            status: "Active",
        })
        .executeTakeFirst();
    return redirect('vehicles/' + registration_number)
}