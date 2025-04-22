import { Auth } from '@repo/handlers/auth'
import { db } from '@repo/database'
import { z } from 'zod'

const kycSchema = z.object({
    national_id_front: z.string(),
    passport_photo: z.string(),
    driving_license: z.string(),
    vehicle_registration: z.string(),
    insurance_certificate: z.string(),
    certificate_of_good_conduct: z.string(),
    vehicle_data: z.object({
        vehicle_name: z.string(),
        vehicle_type: z.enum(['Bus', 'Van', 'Car']),
        vehicle_model: z.string(),
        vehicle_year: z.number(),
        vehicle_image_url: z.string().optional(),
        seat_count: z.number(),
        available_seats: z.number(),
        is_inspected: z.boolean()
    })
})

export async function GET(req: Request) {
    const auth = new Auth()
    const { payload } = auth.checkApiToken({ req })
    if (!payload) {
        return Response.json({
            status: 'error',
            message: 'Unauthorized'
        }, { status: 401 })
    }
    const kyc = await db.selectFrom('kyc')
        .select(['national_id_front', 'passport_photo', 'driving_license', 'vehicle_registration', 'insurance_certificate', 'certificate_of_good_conduct', 'vehicle_data', 'created_at', 'updated_at', 'comments', 'is_verified', 'status'])
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
    const { payload } = auth.checkApiToken({ req })
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
    const { national_id_front, passport_photo, driving_license, vehicle_registration, insurance_certificate, certificate_of_good_conduct, vehicle_data } = check.data;
    const kyc = await db.insertInto('kyc')
        .values({
            user_id: payload.id,
            national_id_front,
            passport_photo,
            driving_license,
            vehicle_registration,
            insurance_certificate,
            certificate_of_good_conduct,
            vehicle_data: JSON.stringify(vehicle_data),
            comments: null,
            is_verified: false,
            status: 'Active'
        })
        .executeTakeFirst()
    // insert vehicle data
    await db.insertInto('vehicle')
        .values({
            user_id: payload.id,
            vehicle_name: vehicle_data.vehicle_name,
            registration_number: vehicle_registration,
            vehicle_type: vehicle_data.vehicle_type,
            vehicle_model: vehicle_data.vehicle_model,
            vehicle_year: vehicle_data.vehicle_year,
            vehicle_image_url: vehicle_data.vehicle_image_url,
            seat_count: vehicle_data.seat_count,
            available_seats: vehicle_data.available_seats,
            is_inspected: false,
            comments: null,
            meta: JSON.stringify(vehicle_data),
            status: 'Inactive'
        })
        .execute()
    return Response.json({
        status: 'success',
    }, { status: 200 })
} 