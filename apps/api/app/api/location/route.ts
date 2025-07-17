// pages/api/stream-drivers.ts
import { db, sql } from "@repo/database";

export async function POST(req: Request) {
  // check cordinates in the last 10 minutes
  const data = await req.json();
  let cordinates = await db
    .selectFrom("location")
    .select(["latitude", "longitude"])
    .where("location.daily_ride_id", "=", data.daily_ride_id)
    .orderBy("location.id", "desc")
    .executeTakeFirst();
  return Response.json({
    latitude: Number(cordinates?.latitude),
    longitude: Number(cordinates?.longitude),
  });
}
