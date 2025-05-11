import { z } from 'zod'
import { db } from '@repo/database'
import { Auth } from '@repo/handlers/auth'

const registerSchema = z.object({
    names: z.string(),
    email: z.string().email().optional(),
    password: z.string().min(8),
    phone_number: z.string().min(10).optional(),
    kind: z.enum(['Driver']),
    county: z.string().optional(),
    neighborhood: z.string().optional()
})

export async function POST(req: Request) {
    const data = await req.json()
    const check = registerSchema.safeParse(data)
    if (!check.success) {
        return Response.json({
            status: 'error',
            message: 'Invalid data'
        }, { status: 400 })
    }
    const { names, email, password, phone_number, kind, county, neighborhood } = check.data
    // make sure email or phone does not exist
    const checkUser = await db.selectFrom('user')
        .select(['id'])
        .where((eb) => eb.or([
            eb('email', '=', email || ''),
            eb('phone_number', '=', phone_number || '')
        ]))
        .executeTakeFirst()
    if (checkUser) {
        return Response.json({
            status: 'error',
            message: 'User already exists'
        }, { status: 400 })
    }
    const auth = new Auth()
    const hash = auth.hash({ password })
    const user = await db.insertInto('user')
        .values({
            name: names,
            email: email || null,
            password: hash,
            phone_number: phone_number,
            kind: kind,
            meta: kind == 'Driver' ? JSON.stringify({
                county: county,
                neighborhood: neighborhood
            }) : null,
            wallet_balance: 0,
            is_kyc_verified: false,
            status: 'Active'
        })
        .returning('id')
        .executeTakeFirst()
    if (!user) {
        return Response.json({
            status: 'error',
            message: 'Failed to register'
        }, { status: 500 })
    }
    const token = auth.encode({ payload: { id: user.id, kind: kind, email: email, phone_number: phone_number } })
    return Response.json({
        status: 'success',
        message: 'User registered successfully',
        access_token: token
    }, { status: 200 })
}