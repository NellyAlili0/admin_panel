// actions, start, end, view, history
import { Auth } from '@repo/handlers/auth'
import { db } from '@repo/database'

export async function GET(req: Request) {
    const auth = new Auth()
    const { payload } = auth.checkApiToken({ req })
    if (!payload) {
        return Response.json({
            status: 'error',
            message: 'Unauthorized'
        }, { status: 401 })
    }
    const action = req.url.split('/').pop()
    if (action === 'view') {
        return Response.json({
            status: 'success'
        }, { status: 200 })
    } else if (action === 'history') {
        return Response.json({
            status: 'success'
        }, { status: 200 })
    } else {
        return Response.json({
            status: 'error',
            message: 'Invalid action'
        }, { status: 400 })
    }
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
    const action = req.url.split('/').pop()
    if (action === 'start') {
        return Response.json({
            status: 'success'
        }, { status: 200 })
    } else if (action === 'end') {
        return Response.json({
            status: 'success'
        }, { status: 200 })
    } else {
        return Response.json({
            status: 'error',
            message: 'Invalid action'
        }, { status: 400 })
    }
}
