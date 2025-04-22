import { db } from '@repo/database'
import { Auth } from '@repo/handlers/auth'
import { z } from 'zod'

export async function GET(req: Request) {
    const auth = new Auth()
    const { payload } = auth.checkApiToken({ req })
    if (!payload) {
        return Response.json({
            status: 'error',
            message: 'Unauthorized'
        }, { status: 401 })
    }
    const transactions = await db.selectFrom('payment')
        .select(['amount', 'paybill_number', 'payment_method', 'payment_status', 'comments', 'meta', 'created_at', 'updated_at'])
        .where('driver_id', '=', payload.id)
        .execute()
    return Response.json({
        status: 'success',
        transactions
    }, { status: 200 })
}

const payoutSchema = z.object({
    method: z.enum(['Bank Transfer', 'Mpesa']),
    gateway: z.string(),
    account_name: z.string(),
    account_number: z.string(),
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
    const check = payoutSchema.safeParse(data)
    if (!check.success) {
        return Response.json({
            status: 'error',
            message: 'Invalid data'
        }, { status: 400 })
    }
    const { method, gateway, account_name, account_number } = check.data
    const userMeta = await db.selectFrom('user')
        .select(['meta'])
        .where('id', '=', payload.id)
        .executeTakeFirst()
    let meta = {
        ...userMeta?.meta,
        payout: {
            method: method,
            gateway: gateway,
            account_name: account_name,
            account_number: account_number
        }
    }
    await db.updateTable('user')
        .set({
            meta: JSON.stringify(meta)
        })
        .where('id', '=', payload.id)
        .execute()
    return Response.json({
        status: 'success'
    }, { status: 200 })
}
