// actions are create, view, history

import { db, sql } from '@repo/database'
import { Auth } from '@repo/handlers/auth'
import { Notify } from '@repo/handlers/notify'
import { z } from 'zod'

const actionSchema = z.object({
    action: z.enum(['create', 'view', 'history', 'today', 'all', 'view_trip']),
    student_id: z.number().optional(),
    ride_id: z.number().optional(),
    trip_id: z.number().optional(),
    date: z.string().optional(),
    schedule: z.object({
        pickup: z.object({
            start_time: z.string(),
            location: z.string(),
            latitude: z.number(),
            longitude: z.number()
        }),
        dropoff: z.object({
            start_time: z.string(),
            location: z.string(),
            latitude: z.number(),
            longitude: z.number()
        }),
        comments: z.string().optional(),
        dates: z.array(z.string()).optional(),
        kind: z.enum(['Private', 'Carpool', 'Bus']).optional()
    }).optional()
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
    const check = actionSchema.safeParse(data)
    if (!check.success) {
        return Response.json({
            status: 'error',
            message: 'Invalid data'
        }, { status: 400 })
    }
    const { action, student_id, ride_id, trip_id, date, schedule } = check.data
    if (action === 'create') {
        // request new ride
        if (!schedule || !student_id) {
            return Response.json({
                status: 'error',
                message: 'Invalid data'
            }, { status: 400 })
        }
        // check if student exists
        const student = await db.selectFrom('student')
            .select(['id', 'name'])
            .where('id', '=', student_id)
            .where('parent_id', '=', payload.id)
            .executeTakeFirst()
        if (!student) {
            return Response.json({
                status: 'error',
                message: 'Student not found'
            }, { status: 404 })
        }
        // add ride to db
        const ride = await db.insertInto('ride')
            .values({
                student_id: student_id,
                parent_id: payload.id,
                schedule: JSON.stringify(schedule),
                comments: schedule.comments,
                status: 'Requested'
            })
            .returning(['id'])
            .executeTakeFirst()
        await db.insertInto('notification')
            .values({
                user_id: payload.id,
                title: 'New Ride Request',
                message: 'You have a new ride request for ' + student.name,
                kind: 'Personal',
                section: 'Rides',
                is_read: false
            })
            .executeTakeFirst()
        const notify = new Notify()
        await notify.sendSingle({
            title: 'New Ride Request',
            message: 'You have a new ride request for ' + student.name + '. This request is being processed by the operators',
            email: payload.email!
        })
        return Response.json({
            status: 'success',
            ride
        }, { status: 200 })
    }
    else if (action == 'all') {
        // get all rides
        const rides = await db.selectFrom('ride')
            .leftJoin('student', 'ride.student_id', 'student.id')
            .leftJoin('user', 'ride.driver_id', 'user.id')
            .leftJoin('vehicle', 'ride.vehicle_id', 'vehicle.id')
            .leftJoin('school', 'ride.school_id', 'school.id')
            .select([
                'ride.id',
                'student.name',
                'user.name',
                'vehicle.vehicle_name',
                'vehicle.registration_number',
                'school.name',
                'ride.schedule',
                'ride.comments',
                'ride.admin_comments',
                'ride.meta',
                'ride.created_at',
                'ride.updated_at',
                'ride.status'
            ])
            .where('ride.parent_id', '=', payload.id)
            .execute()
        return Response.json({
            status: 'success',
            rides
        }, { status: 200 })
    }
    else if (action == 'history') {
        const rides = await db.selectFrom('daily_ride')
            .leftJoin('ride', 'daily_ride.ride_id', 'ride.id')
            .leftJoin('student', 'ride.student_id', 'student.id')
            .leftJoin('user', 'daily_ride.driver_id', 'user.id')
            .leftJoin('vehicle', 'daily_ride.vehicle_id', 'vehicle.id')
            .leftJoin('school', 'ride.school_id', 'school.id')
            .select([
                'daily_ride.id',
                'student.name',
                'user.name as driver_name',
                'vehicle.vehicle_name',
                'vehicle.registration_number',
                'school.name',
                'daily_ride.start_time',
                'daily_ride.end_time',
                'daily_ride.kind',
                'daily_ride.status'
            ])
            .where('ride.parent_id', '=', payload.id)
            .execute()
        return Response.json({
            status: 'success',
            rides
        }, { status: 200 })
    }
    else if (action == 'today') {
        // get today's rides. Use format to get today's date
        let today: any = formatDate(new Date())
        if (date) {
            today = formatDate(new Date(date))
        }
        const rides = await db.selectFrom('daily_ride')
            .leftJoin('ride', 'daily_ride.ride_id', 'ride.id')
            .leftJoin('student', 'ride.student_id', 'student.id')
            .leftJoin('user', 'daily_ride.driver_id', 'user.id')
            .leftJoin('vehicle', 'daily_ride.vehicle_id', 'vehicle.id')
            .leftJoin('school', 'ride.school_id', 'school.id')
            .select([
                'daily_ride.id',
                'student.name as passenger',
                'user.name as driver_name',
                'user.phone_number as driver_phone',
                'daily_ride.kind',
                'vehicle.vehicle_name',
                'vehicle.registration_number',
                'school.name',
                'daily_ride.start_time',
                'daily_ride.end_time',
                'daily_ride.kind',
                'daily_ride.status'
            ])
            .where('ride.parent_id', '=', payload.id)
            .where('daily_ride.date', '=', today)
            .orderBy('daily_ride.start_time', 'asc')
            .execute()
        return Response.json({
            status: 'success',
            rides
        }, { status: 200 })
    }
    else if (action == 'view') {
        const rides = await db.selectFrom('daily_ride')
            .leftJoin('ride', 'daily_ride.ride_id', 'ride.id')
            .leftJoin('student', 'ride.student_id', 'student.id')
            .leftJoin('user', 'daily_ride.driver_id', 'user.id')
            .leftJoin('vehicle', 'daily_ride.vehicle_id', 'vehicle.id')
            .leftJoin('school', 'ride.school_id', 'school.id')
            .select([
                'daily_ride.id',
                'schedule',
                'ride.status as ride_status',
                'student.name',
                'user.name as driver_name',
                'user.phone_number as driver_phone',
                'vehicle.vehicle_name',
                'school.name',
                'daily_ride.start_time',
                'daily_ride.end_time',
                'daily_ride.kind',
                'daily_ride.status'
            ])
            .where('ride.parent_id', '=', payload.id)
            .where('ride.id', '=', ride_id!)
            .execute()
        return Response.json({
            status: 'success',
            rides
        }, { status: 200 })
    }
    else if (action == 'view_trip') {
        const ride = await db.selectFrom('daily_ride')
            .leftJoin('ride', 'daily_ride.ride_id', 'ride.id')
            .leftJoin('student', 'ride.student_id', 'student.id')
            .leftJoin('user', 'daily_ride.driver_id', 'user.id')
            .leftJoin('vehicle', 'daily_ride.vehicle_id', 'vehicle.id')
            .leftJoin('school', 'ride.school_id', 'school.id')
            .select([
                'daily_ride.id',
                'student.name',
                'user.name as driver_name',
                'user.phone_number as driver_phone',
                'vehicle.vehicle_name',
                'school.name',
                'schedule',
                'daily_ride.start_time',
                'daily_ride.end_time',
                'daily_ride.kind',
                'daily_ride.status'
            ])
            .where('ride.parent_id', '=', payload.id)
            .where('daily_ride.date', '=', new Date(date!))
            .where('daily_ride.id', '=', trip_id!)
            .executeTakeFirst()
        // location data
        const location = await db.selectFrom('location')
            .select(['id', 'latitude', 'longitude'])
            .where('daily_ride_id', '=', trip_id!)
            .executeTakeFirst()
        return Response.json({
            status: 'success',
            ride,
            location
        }, { status: 200 })
    }
}

function formatDate(date: Date) {
    return new Date(date).toISOString().split('T')[0]
}