"use server"

import { db } from "@repo/database";
import { revalidatePath } from "next/cache";
import { zfd } from "zod-form-data";
import { Notify } from "@repo/handlers/notify";

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
