import { z } from 'zod'
import { db } from '@repo/database'

const schema = z.object({
    driver_id: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    timestamp: z.number(),
    kind: z.enum(['pickup', 'dropoff']).optional()
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
    const { driver_id, latitude, longitude, timestamp, kind } = check.data
    // find all trips that are active with the current driver id
    const trips = await db.selectFrom('daily_ride')
        .leftJoin('user', 'daily_ride.driver_id', 'user.id')
        .select(['daily_ride.id'])
        .where('user.email', '=', driver_id)
        .where('daily_ride.kind', '=', kind == 'pickup' ? 'Pickup' : 'Dropoff')
        .where('daily_ride.status', '=', 'Active')
        .execute()
    
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
