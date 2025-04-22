// change password
import { Auth } from '@repo/handlers/auth'
import { db } from '@repo/database'
import { z } from 'zod'

const passwordSchema = z.object({
    old_password: z.string().min(6),
    new_password: z.string().min(6)
})

export async function POST(req: Request) {
    const auth = new Auth()
    const payload = auth.checkApiToken({ req })
    if (!payload) {
        return Response.json({
            status: 'error',
            message: 'Unauthorized'
        }, { status: 401 })
    }
    const data = await req.json()
    const check = passwordSchema.safeParse(data)
    if (!check.success) {
        return Response.json({
            status: 'error',
            message: 'Invalid data'
        }, { status: 400 })
    }
    const { old_password, new_password } = check.data
    const user = await db.selectFrom('user')
        .select(['id', 'password'])
        .where('id', '=', payload.id)
        .limit(1)
        .executeTakeFirst()
    if (!user) {
        return Response.json({
            status: 'error',
            message: 'User not found'
        }, { status: 404 })
    }
    const isMatch = await auth.compare({ password: old_password, hash: user.password })
    if (!isMatch) {
        return Response.json({
            status: 'error',
            message: 'The Current password did not match your account'
        }, { status: 400 })
    }
    const hash = await auth.hash({ password: new_password })
    const updatedUser = await db.updateTable('user')
        .set({
            password: hash
        })
        .where('id', '=', payload.id)
        .executeTakeFirst()
    // TODO: Send email
    return Response.json({
        status: 'success',
        message: 'Password changed successfully'
    }, { status: 200 })
}