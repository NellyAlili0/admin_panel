// drivers and parents only
import { z } from 'zod'
import { db } from '@repo/database'
import { Auth } from '@repo/handlers/auth';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    kind: z.enum(['Driver', 'Parent'])
})

export async function POST(req: Request) {
    const data = await req.json()
    const check = loginSchema.safeParse(data)
    if (!check.success) {
        return Response.json({
            status: 'error',
            message: 'Invalid data'
        }, { status: 400 })
    }
    const { email, password, kind } = check.data
    const auth = new Auth()
    console.log(auth.hash({ password }))
    const user = await db.selectFrom('user')
        .selectAll()
        .where('email', '=', email)
        .where('kind', '=', kind)
        .where('status', '=', 'Active')
        .executeTakeFirst()
    if (!user) {
        return Response.json({
            status: 'error',
            message: 'Invalid credentials'
        }, { status: 401 })
    }
    const isPasswordValid = await auth.compare({ password, hash: user.password })
    if (!isPasswordValid) {
        return Response.json({
            status: 'error',
            message: 'Invalid credentials'
        }, { status: 401 })
    }
    const token = auth.encode({ payload: { id: user.id, kind: user.kind, email: user.email, phone_number: user.phone_number } })
    return Response.json({
        status: 'success',
        message: 'Login successful',
        access_token: token
    }, { status: 200 })
}