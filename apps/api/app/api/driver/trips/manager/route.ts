import { db, sql } from '@repo/database'
import { Auth } from '@repo/handlers/auth'
import { Notify } from '@repo/handlers/notify'
import { z } from 'zod'

const schema = z.object({
    action: z.enum(['today', 'start_all', 'end_all', 'update', 'students']),
    kind: z.enum(['pickup', 'dropoff']).optional(),
    student_id: z.number().optional(),
    trip_id: z.number().optional(),
    trips: z.array(z.number()).optional(),
    ride_id: z.string().optional(),
    date: z.string().optional()
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
    const check = schema.safeParse(data)
    if (!check.success) {
        return Response.json({
            status: 'error',
            message: 'Invalid data'
        }, { status: 400 })
    }
    const { action, trip_id, trips, ride_id, date, kind, student_id } = check.data
    let today: any = formatDate(new Date())
    const rides = await db.selectFrom('daily_ride')
        .leftJoin('ride', 'daily_ride.ride_id', 'ride.id')
        .leftJoin('student', 'ride.student_id', 'student.id')
        .leftJoin('user', 'daily_ride.driver_id', 'user.id')
        .leftJoin('vehicle', 'daily_ride.vehicle_id', 'vehicle.id')
        .leftJoin('school', 'ride.school_id', 'school.id')
        .select([
            'daily_ride.id',
            'student.name as passenger',
            'student.id as passenger_id',
            'student.parent_id',
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
        .where('daily_ride.driver_id', '=', payload.id)
        .where('daily_ride.date', '=', today)
        .orderBy('daily_ride.start_time', 'asc')
        .execute()
    // turn to arrays
    let pickup = rides.filter((ride) => ride.kind === 'Pickup')
    let dropoff = rides.filter((ride) => ride.kind === 'Dropoff')
    if (action === 'today') {
        let total_trips: any = await sql`SELECT COUNT(*) as total FROM daily_ride WHERE driver_id = ${payload.id};`.execute(db)
        total_trips = total_trips.rows[0]['total']
        let upcoming: any = await sql`SELECT COUNT(*) as total FROM daily_ride WHERE driver_id = ${payload.id} AND date > ${today};`.execute(db)
        upcoming = upcoming.rows[0]['total']
        return Response.json({
            status: 'success',
            rides,
            pickup,
            dropoff,
            total_trips: total_trips,
            upcoming: upcoming
        }, { status: 200 })
    }
    else if (action === 'start_all') {
        // get parents emails and send Notification
        let emails: string[] = []
        for (let trip of rides) {
            let parent = await db.selectFrom('user')
                .select([
                    'user.email'
                ])
                .where('user.id', '=', trip.parent_id)
                .executeTakeFirst()
            if (parent) {
                emails.push(parent.email!)
            }
        }
        let notify = new Notify()
        if (kind === 'pickup') {
            await db.updateTable('daily_ride')
                .set({
                    status: 'Active'
                })
                .where('id', 'in', rides.map((ride) => ride.id))
                .execute()
            emails.forEach(async (email) => {
                notify.sendSingle({
                    title: 'Trip Pickup',
                    message: 'Driver has started the trip',
                    email: email
                })
            })
            return Response.json({
                status: 'success'
            }, { status: 200 })
        } else if (kind === 'dropoff') {
            await db.updateTable('daily_ride')
                .set({
                    status: 'Active'
                })
                .where('id', 'in', rides.map((ride) => ride.id))
                .execute()
            emails.forEach(async (email) => {
                notify.sendSingle({
                    title: 'Trip Dropoff',
                    message: 'Driver has started the trip',
                    email: email
                })
            })
            return Response.json({
                status: 'success'
            }, { status: 200 })
        }
    }
    else if (action === 'end_all') {
        let emails: string[] = []
        for (let trip of rides) {
            let parent = await db.selectFrom('user')
                .select([
                    'user.email'
                ])
                .where('user.id', '=', trip.parent_id)
                .executeTakeFirst()
            if (parent) {
                emails.push(parent.email!)
            }
        }
        let notify = new Notify()
        if (kind === 'pickup') {
            await db.updateTable('daily_ride')
                .set({
                    status: 'Finished'
                })
                .where('id', 'in', rides.map((ride) => ride.id))
                .execute()
            emails.forEach(async (email) => {
                notify.sendSingle({
                    title: 'Trip Pickup',
                    message: 'Driver has finished the trip',
                    email: email
                })
            })
            return Response.json({
                status: 'success'
            }, { status: 200 })
        } else if (kind === 'dropoff') {
            await db.updateTable('daily_ride')
                .set({
                    status: 'Finished'
                })
                .where('id', 'in', rides.map((ride) => ride.id))
                .execute()
            emails.forEach(async (email) => {
                notify.sendSingle({
                    title: 'Trip Dropoff',
                    message: 'Driver has finished the trip',
                    email: email
                })
            })
            return Response.json({
                status: 'success'
            }, { status: 200 })
        }
    }
    else if (action === 'students') {
        // return students info
        let students: any = [];
        for (let trip of kind === 'pickup' ? pickup : dropoff) {
            let student: any = await db.selectFrom('student')
                .leftJoin('user', 'student.parent_id', 'user.id')
                .select([
                    'student.id',
                    'student.name',
                    'student.gender',
                    'student.profile_picture',
                    'user.name as parent_name',
                    'user.email',
                    'user.phone_number as parent_phone'
                ])
                .where('student.id', '=', trip.passenger_id)
                .executeTakeFirst()
            student['status'] = trip.status
            if (student) {
                students.push(student)
            }
        }
        return Response.json({
            status: 'success',
            students
        }, { status: 200 })
    }
    else if (action === 'update') {
        // get student id and action and mark as picked up or dropped off
        // check in rides of today for student_id
        const student_ride = rides.find((ride) => ride.passenger_id === student_id)
        if (!student_ride) {
            return Response.json({
                status: 'error',
                message: 'Student not found'
            }, { status: 404 })
        }
        await db.updateTable('daily_ride')
            .set({
                end_time: new Date(),
                status: 'Finished',
            })
            .where('id', '=', student_ride.id)
            .where('driver_id', '=', payload.id)
            .where('kind', '=', kind === 'pickup' ? 'Pickup' : 'Dropoff')
            .executeTakeFirst()
        // send message to parent
        const parent = await db.selectFrom('user')
            .select([
                'user.email'
            ])
            .where('user.id', '=', student_ride.parent_id)
            .executeTakeFirst()
        const notify = new Notify()
        if (parent) {
            notify.sendSingle({
                title: 'Trip Update',
                message: 'Your child has been ' + (kind === 'pickup' ? 'picked up' : 'dropped off'),
                email: parent.email!
            })
        }
        return Response.json({
            status: 'success'
        }, { status: 200 })
    }
}

function formatDate(date: Date) {
    return new Date(date).toISOString().split('T')[0]
}