"use server"
import { Auth } from "@repo/handlers/auth";
import { redirect } from "next/navigation";
import { db } from "@repo/database";
import { z } from "zod"
import { cookies } from "next/headers";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
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
        const user = await db.selectFrom('user')
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
        const token = auth.encode({ payload: { id: user.id, kind: user.kind, email: user.email, phone_number: user.phone_number } })
        const cookieStore = await cookies()
        cookieStore.set('token', token)
        return redirect('/home')
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

