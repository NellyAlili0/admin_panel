"use server"

import { db } from "@repo/database";
import { revalidatePath } from "next/cache";
import { zfd } from "zod-form-data";
import { Notify } from "@repo/handlers/notify";
import { redirect } from "next/navigation";
import { Auth } from "@repo/handlers/auth";

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
    let { driver_id, vehicle_name, registration_number, vehicle_type, vehicle_model, vehicle_year, seat_count, is_inspected, comments } = data.data
    // make sure the registration number does not exist
    // get email of driver
    // remove spacing fomr registration number
    registration_number = registration_number.replace(" ", "");
    let driver = await db.selectFrom("user")
        .select(["user.email"])
        .where("user.id", "=", Number(driver_id))
        .executeTakeFirst();
    let vehicle = await db.selectFrom("vehicle")
        .select(["id"])
        .where("registration_number", "=", registration_number)
        .executeTakeFirst();
    if (vehicle) {
        return { message: "Vehicle with this registration number already exists" }
    }
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
    revalidatePath("/drivers/" + driver?.email)
    return redirect('/vehicles/' + registration_number)
}


export async function deleteVehicle(prevState: any, formData: FormData) {
    const data = zfd.formData({
        vehicle_id: zfd.text(),
    }).safeParse(formData)
    if (!data.success) {
        return { message: "Invalid vehicle id" }
    }
    const { vehicle_id } = data.data
    await db
        .deleteFrom("vehicle")
        .where("id", "=", Number(vehicle_id))
        .executeTakeFirst();
    return { message: "Vehicle deleted successfully" }
}


export async function editDriver(prevState: any, formData: FormData) {
    const data = zfd.formData({
        driver_id: zfd.text(),
        name: zfd.text(),
        email: zfd.text(),
        phone_number: zfd.text(),
        neighborhood: zfd.text(),
        county: zfd.text(),
    }).safeParse(formData)
    if (!data.success) {
        return { message: "Invalid data" }
    }
    const { driver_id, name, email, phone_number, neighborhood, county } = data.data
    await db
        .updateTable("user")
        .set({
            name: name,
            email: email,
            phone_number: phone_number,
            meta: JSON.stringify({
                neighborhood: neighborhood,
                county: county
            })
        })
        .where("id", "=", Number(driver_id))
        .executeTakeFirst();
    return { message: "Driver updated successfully" }
}

export async function changePassword(prevState: any, formData: FormData) {
    const data = zfd.formData({
        driver_id: zfd.text(),
        password: zfd.text(),
    }).safeParse(formData)
    if (!data.success) {
        return { message: "Invalid data" }
    }
    const { driver_id, password } = data.data
    let auth = new Auth()
    const hash = await auth.hash({ password: password })
    await db
        .updateTable("user")
        .set({
            password: hash,
        })
        .where("id", "=", Number(driver_id))
        .executeTakeFirst();
    return { message: "Password changed successfully" }
}