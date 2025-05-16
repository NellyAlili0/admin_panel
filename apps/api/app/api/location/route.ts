// pages/api/stream-drivers.ts
import { db, sql } from "@repo/database";


export async function GET(req: Request) {
  // check cordinates in the last 10 minutes
  let cordinates = await db.selectFrom('location')
    .select([
      'latitude',
      'longitude',
    ])
    .where('location.daily_ride_id', '=', 2)
    .orderBy('location.id', 'desc')
    .executeTakeFirst();
  return Response.json({
    latitude: Number(cordinates?.latitude),
    longitude: Number(cordinates?.longitude),
  })
}