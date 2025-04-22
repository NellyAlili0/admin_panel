import { Auth } from '@repo/handlers/auth'
import { db } from '@repo/database'
import { z } from 'zod'

export async function GET(req: Request) {
    const auth = new Auth()
    const payload = auth.checkApiToken({ req })
    if (!payload) {
        return Response.json({
            status: 'error',
            message: 'Unauthorized'
        }, { status: 401 })
    }
    const parent = await db.selectFrom('user')
        .select(['first_name', 'last_name', 'email', 'phone_number', 'created_at', 'updated_at', 'status'])
        .where('id', '=', payload.id)
        .limit(1)
        .executeTakeFirst()
    return Response.json({
        status: 'success',
        parent
    }, { status: 200 })
}

const profileSettings = z.object({
    first_name: z.string(),
    last_name: z.string(),
    email: z.string().email().optional(),
    phone_number: z.string().min(10).max(15).optional(),
    profile_image_url: z.string().optional()
})

export async function POST(req: Request) {
    const auth = new Auth()
    const { payload } = auth.checkApiToken({ req })
    if (!payload) {
        return Response.json({
            status: 'error',
            message: 'Unauthorized'
        }, { status: 401 })
    }
    const data = await req.json()
    const check = profileSettings.safeParse(data)
    if (!check.success) {
        return Response.json({
            status: 'error',
            message: 'Invalid data'
        }, { status: 400 })
    }
    const { first_name, last_name, email, phone_number, profile_image_url } = check.data
    const user = await db.selectFrom('user')
        .select(['id', 'first_name', 'meta', 'last_name', 'email', 'phone_number', 'created_at', 'updated_at', 'status'])
        .where('id', '=', payload.id)
        .limit(1)
        .executeTakeFirst()
    if (!user) {
        return Response.json({
            status: 'error',
            message: 'User not found'
        }, { status: 404 })
    }
    let meta = {
        ...user.meta,
        profile_pic: profile_image_url
    }
    const parent = await db.updateTable('user')
        .set({
            first_name,
            last_name,
            email: email || user.email,
            phone_number: phone_number || user.phone_number,
            meta: JSON.stringify(meta)
        })
        .where('id', '=', payload.id)
        .executeTakeFirst()
    return Response.json({
        status: 'success',
        parent
    }, { status: 200 })
}

