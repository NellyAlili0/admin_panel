
import { z } from "zod";
import { Auth } from "@repo/handlers/auth";
import { db } from "@repo/database";

const vehicleSchema = z.object({
    vehicle_name: z.string(),
    registration_number: z.string(),
    vehicle_type: z.enum(['Bus', 'Van', 'Car']),
    vehicle_model: z.string(),
    vehicle_year: z.number(),
    vehicle_image_url: z.string().optional(),
    seat_count: z.number(),
    vehicle_registration: z.string().optional(),
    insurance_certificate: z.string().optional(),
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
    const check = vehicleSchema.safeParse(data)
    if (!check.success) {
        return Response.json({
            status: 'error',
            message: 'Invalid data'
        }, { status: 400 })
    }
    const { vehicle_name, registration_number, vehicle_type, vehicle_model, vehicle_year, vehicle_image_url, seat_count, vehicle_registration, insurance_certificate } = check.data
    // make sure driver has no other vehicle
    const vehicle = await db.selectFrom('vehicle')
        .select(['id'])
        .where('user_id', '=', payload.id)
        .executeTakeFirst()
    if (vehicle) {
        return Response.json({
            status: 'error',
            message: 'Driver already has a vehicle'
        }, { status: 400 })
    }
    // check if vehicle registration number is unique
    const vehicleRegistration = await db.selectFrom('vehicle')
        .select(['id'])
        .where('registration_number', '=', registration_number)
        .executeTakeFirst()
    if (vehicleRegistration) {
        return Response.json({
            status: 'error',
            message: 'Vehicle registration number already exists'
        }, { status: 400 })
    }
    await db.insertInto('vehicle')
        .values({
            user_id: payload.id,
            vehicle_name: vehicle_name,
            registration_number: registration_number,
            vehicle_type: vehicle_type,
            vehicle_model: vehicle_model,
            vehicle_year: vehicle_year,
            vehicle_image_url: vehicle_image_url,
            seat_count: seat_count,
            available_seats: seat_count,
            is_inspected: false,
            vehicle_registration: vehicle_registration || null,
            insurance_certificate: insurance_certificate || null,
            comments: null,
            status: 'Inactive'
        })
        .executeTakeFirst()
    return Response.json({
        status: 'success',
    }, { status: 200 })
}

export async function GET(req: Request) {
    const auth = new Auth()
    const payload = auth.checkApiToken({ req })
    if (!payload) {
        return Response.json({
            status: 'error',
            message: 'Unauthorized'
        }, { status: 401 })
    }
    const vehicle = await db.selectFrom('vehicle')
        .select(['id', 'vehicle_name', 'registration_number', 'vehicle_type', 'vehicle_model', 'vehicle_year', 'vehicle_image_url', 'seat_count', 'available_seats', 'is_inspected', 'vehicle_registration', 'insurance_certificate', 'comments', 'status'])
        .where('user_id', '=', payload.id)
        .executeTakeFirst()
    return Response.json({
        status: 'success',
        vehicle
    }, { status: 200 })
}
