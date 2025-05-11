"use server"

import { zfd } from "zod-form-data"
import { z } from "zod"
import { db } from "@repo/database"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const createSchoolSchema = zfd.formData(z.object({
    name: zfd.text(z.string()),
    location: zfd.text(z.string()),
    comments: zfd.text(z.string().optional()),
    longitude: zfd.text(z.string()),
    latitude: zfd.text(z.string()),
    administratorName: zfd.text(z.string()),
    administratorPhone: zfd.text(z.string()),
}))

export async function create(prevState: any, formData: FormData) {
    const data = createSchoolSchema.safeParse(formData)
    if (!data.success) {
        return {
            message: "Invalid Data Submitted",
        }
    }
    const { name, location, comments, longitude, latitude, administratorName, administratorPhone } = data.data
    let school = await db.insertInto("school")
        .values({
            name: name, location: location, comments: comments,
            meta: JSON.stringify({
                administrator_name: administratorName,
                administrator_phone: administratorPhone,
                longitude: Number(longitude),
                latitude: Number(latitude)
            })
        }).returning('id').executeTakeFirst()
    revalidatePath("/schools")
    if (!school) {
        return {
            message: "Failed to create school",
        }
    }
    return redirect(`/schools/${school.id}`)
}
