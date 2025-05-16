"use server"

import { zfd } from "zod-form-data";
import { Auth } from "@repo/handlers/auth";
import { db } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// add driver

const addDriverSchema = zfd.formData({
    name: zfd.text(),
    email: zfd.text(),
    phone_number: zfd.text(),
    password: zfd.text(),
    neighborhood: zfd.text(),
    county: zfd.text(),
})
export async function addDriver(prevState: any, formData: FormData) {
    const data = addDriverSchema.safeParse(formData)
    if (!data.success) {
        return { message: "Invalid data" }
    }
    const { name, email, phone_number, password, neighborhood, county } = data.data
    let auth = new Auth()
    const hash = await auth.hash({ password: password })
    // make sure email does not exist
    let user = await db
        .selectFrom("user")
        .select(["id"])
        .where("email", "=", email)
        .executeTakeFirst();
    if (user) {
        return { message: "Email already exists" }
    }
    await db
        .insertInto("user")
        .values({
            name,
            email,
            phone_number,
            password: hash,
            kind: "Driver",
            status: "Active",
            wallet_balance: 0,
            is_kyc_verified: false,
            meta: JSON.stringify({
                neighborhood: neighborhood || "",
                county: county || ""
            })
        })
        .executeTakeFirst();
    revalidatePath("/drivers");
    return redirect("/drivers");
}
