import { Auth } from '@repo/handlers/auth'
import { db } from '@repo/database'

export async function POST(req: Request) {
    const auth = new Auth()
    const { payload } = auth.checkApiToken({ req })
    if (!payload) {
        return Response.json({
            status: 'error',
            message: 'Unauthorized'
        }, { status: 401 })
    }
    const user = await db.selectFrom('user')
        .select(['first_name', 'last_name', 'email', 'phone_number', 'meta', 'kind', 'created_at', 'updated_at', 'status'])
        .where('id', '=', payload.id)
        .where('kind', '=', payload.kind)
        .executeTakeFirst()
    if (!user) {
        return Response.json({
            status: 'error',
            message: 'Unauthorized'
        }, { status: 401 })
    }
    return Response.json({
        status: 'success',
        message: 'User found',
        user
    }, { status: 200 })
}