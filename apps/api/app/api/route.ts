export async function GET(req: Request) {
    return Response.json({
        status: 'success',
        message: 'Zidallie Handler',
        version: '2.0.1'
    });
}