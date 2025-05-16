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
    const notifications = await db.selectFrom('notification')
        .select([
            'title',
            'message',
            'is_read',
            'kind',
            'section',
            'created_at',
        ])
        .where('user_id', '=', payload.id)
        .orderBy('created_at', 'desc')
        .limit(50)
        .execute()
    return Response.json({
        status: 'success',
        notifications
    }, { status: 200 })
}

export async function PATCH(req: Request) {
    const auth = new Auth()
    const payload = auth.checkApiToken({ req })
    if (!payload) {
        return Response.json({
            status: 'error',
            message: 'Unauthorized'
        }, { status: 401 }) 
    }
    await db.updateTable('notification')
        .set({
            is_read: true
        })
        .where('user_id', '=', payload.id)
        .execute()
    return Response.json({
        status: 'success'
    }, { status: 200 })
}

const notificationSettingsSchema = z.object({
    start_trip_reminder: z.boolean(),
    trip_cancellation_alert: z.boolean(),
    delay_alerts: z.boolean(),
    payments_notifications: z.boolean(),
    shift_assignments: z.boolean()
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
    const check = notificationSettingsSchema.safeParse(data)
    if (!check.success) {
        return Response.json({
            status: 'error',
            message: 'Invalid data'
        }, { status: 400 })
    }
    const { start_trip_reminder, trip_cancellation_alert, delay_alerts, payments_notifications, shift_assignments } = check.data
    const user = await db.selectFrom('user')
        .select(['meta'])
        .where('id', '=', payload.id)
        .executeTakeFirst()
    let newMeta = {
        ...user?.meta,
        notification_settings: {
            start_trip_reminder,
            trip_cancellation_alert,
            delay_alerts,
            payments_notifications,
            shift_assignments
        }
    }
    await db.updateTable('user')
        .set({
            meta: JSON.stringify(newMeta)
        })
        .where('id', '=', payload.id)
        .execute()
    return Response.json({
        status: 'success'
    }, { status: 200 })
}