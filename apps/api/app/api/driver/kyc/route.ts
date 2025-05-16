import { Auth } from '@repo/handlers/auth'
import { db } from '@repo/database'
import { z } from 'zod'
import { Notify } from '@repo/handlers/notify'

const kycSchema = z.object({
    national_id_front: z.string(),
    national_id_back: z.string(),
    passport_photo: z.string(),
    driving_license: z.string(),
    certificate_of_good_conduct: z.string(),
})

export async function GET(req: Request) {
    const auth = new Auth()
    const payload = auth.checkApiToken({ req })
    if (!payload) {
        return Response.json({
            status: 'error',
            message: 'Unauthorized'
        }, { status: 401 })
    }
    const kyc = await db.selectFrom('kyc')
        .select([
            'is_verified',
            'created_at',
            'updated_at'
        ])
        .where('user_id', '=', payload.id)
        .limit(5)
        .execute()
    return Response.json({
        status: 'success',
        kyc
    }, { status: 200 })
}

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
    const check = kycSchema.safeParse(data)
    if (!check.success) {
        return Response.json({
            status: 'error',
            message: 'Invalid data'
        }, { status: 400 })
    }
    const { national_id_front, national_id_back, passport_photo, driving_license, certificate_of_good_conduct } = check.data;
    const kyc = await db.insertInto('kyc')
        .values({
            user_id: payload.id,
            national_id_front,
            national_id_back,
            passport_photo,
            driving_license,
            certificate_of_good_conduct,
            comments: null,
            is_verified: false,
        })
        .executeTakeFirst()
    // add notification
    await db.insertInto('notification')
        .values({
            user_id: payload.id,
            title: 'KYC Requested',
            message: 'Your KYC request has been submitted. Please wait for approval within 72 hours',
            kind: 'System',
            section: 'Profile',
            is_read: false,
        })
        .executeTakeFirst()

    let notify = new Notify()
    await notify.sendSingle({
        email: payload.email,
        title: 'KYC Requested',
        message: 'Your KYC request has been submitted. Please wait for approval within 72 hours',
    })
    return Response.json({
        status: 'success',
    }, { status: 200 })
} 