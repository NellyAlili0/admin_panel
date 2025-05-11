import { z } from 'zod'
import { db } from '@repo/database'

const schema = z.object({
    driver_id: z.number(),
    latitude: z.number(),
    longitude: z.number()
})

export async function POST(req: Request) {
    const data = await req.json()
    const check = schema.safeParse(data)
    if (!check.success) {
        return Response.json({
            status: 'error',
            message: 'Invalid data'
        }, { status: 400 })
    }
    const { driver_id, latitude, longitude } = check.data
    // find all trips that are active with the current driver id
    const trips = await db.selectFrom('daily_ride')
        .select(['id'])
        .where('driver_id', '=', driver_id)
        .where('status', '=', 'Active')
        .execute()
    if (trips.length === 0) {
        return Response.json({
            status: 'error',
            message: 'No active trips found'
        }, { status: 404 })
    }
    // insert location for each trip
    for (const trip of trips) {
        await db.insertInto('location')
            .values({
                daily_ride_id: trip.id,
                latitude,
                longitude
            })
            .executeTakeFirst()
    }
    return Response.json({
        status: 'success'
    }, { status: 200 })
}
