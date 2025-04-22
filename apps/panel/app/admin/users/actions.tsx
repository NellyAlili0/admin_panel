"use server";

import { db } from "@repo/database";
import { Auth } from "@repo/handlers/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { zfd } from "zod-form-data";

const schema = zfd.formData({
    names: zfd.text(z.string()),
    email: zfd.text(z.string().email()),
    password: zfd.text(z.string()),
    role: zfd.text(z.enum(['Finance', 'Admin', 'Operations'])),
})

export async function addUser(prevState: any, formData: FormData) {
    try {
        const validatedFields = schema.safeParse(formData)
        if (!validatedFields.success) {
            return {
                errors: 'Invalid Data Submitted'
            }
        }
        const { names, email, password, role } = validatedFields.data
        let auth = new Auth();
        const hashedPassword = auth.hash({ password: password })
        const user = await db.insertInto('admin')
            .values({
                name: names,
                email,
                password: hashedPassword,
                role,
                status: 'Active'
            })
            .returning('id')
            .executeTakeFirst()
        if (!user) {
            return {
                errors: 'Failed to create user'
            }
        }
        revalidatePath('/admin/users')
        return {
            success: 'User created successfully'
        }
    } catch (error) {
        return {
            errors: 'Something went wrong'
        }
    }
}

const updateSchema = zfd.formData({
    id: zfd.text(z.string()),
    names: zfd.text(z.string()),
    email: zfd.text(z.string().email()),
    role: zfd.text(z.enum(['Finance', 'Admin', 'Operations'])),
    status: zfd.text(z.enum(['Active', 'Inactive'])),
})

export async function updateUser(prevState: any, formData: FormData) {
    try {
        const validatedFields = updateSchema.safeParse(formData)
        if (!validatedFields.success) {
            return {
                errors: 'Invalid Data Submitted'
            }
        }
        const { names, email, role, id, status } = validatedFields.data
        const user = await db.updateTable('admin')
            .set({
                name: names,
                email,
                role,
                status
            })
            .where('id', '=', Number(id))
            .returning('id')
            .executeTakeFirst()
        if (!user) {
            return {
                errors: 'Failed to update user'
            }
        }
        revalidatePath('/admin/users')
        return {
            success: 'User updated successfully'
        }
    } catch (error) {
        return {
            errors: 'Something went wrong'
        }
    }
}
