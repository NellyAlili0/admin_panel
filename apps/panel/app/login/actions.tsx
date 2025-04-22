"use server"
import { Auth } from "@repo/handlers/auth";
import { redirect } from "next/navigation";
import { db } from "@repo/database";
import { z } from "zod"
import { zfd } from "zod-form-data";
import { cookies } from "next/headers";

const loginSchema = zfd.formData({
    email: zfd.text(z.string().email()),
    password: zfd.text(z.string()),
})

export async function login(prevState: any, formData: FormData) {
    try {
        const validatedFields = loginSchema.safeParse(formData)
        if (!validatedFields.success) {
            return {
                errors: 'Invalid Data Submitted'
            }
        }
        const { email, password } = validatedFields.data
        const auth = new Auth()
        const user = await db.selectFrom('admin')
            .selectAll()
            .where('email', '=', email)
            .where('status', '=', 'Active')
            .executeTakeFirst()
        if (!user) {
            return {
                errors: 'Invalid credentials'
            }
        }
        const isPasswordValid = await auth.compare({ password, hash: user.password })
        if (!isPasswordValid) {
            return {
                errors: 'Invalid credentials'
            }
        }
        const token = auth.encode({ payload: { id: user.id, role: user.role, email: user.email } })
        const cookieStore = await cookies()
        cookieStore.set('token', token)
        return redirect('/' + user.role.toLowerCase())
    } catch (error) {
        return {
            errors: 'Something went wrong'
        }
    }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('token')
    return redirect('/login')
}

