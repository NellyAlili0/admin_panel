// pages/api/stream-drivers.ts
import { db, sql } from "@repo/database";

export async function POST(req: Request) {
  // check cordinates in the last 10 minutes
  const data = await req.json();
  if (!data.daily_ride_id) {
    return Response.json({ error: "Missing daily_ride_id" }, { status: 400 });
  }

  let cordinates = await db
    .selectFrom("location")
    .select(["latitude", "longitude"])
    .where("location.daily_ride_id", "=", data.daily_ride_id)
    .orderBy("location.id", "desc")
    .executeTakeFirst();

  if (!cordinates) {
    return Response.json({ error: "No location data found" }, { status: 404 });
  }

  return Response.json({
    latitude: Number(cordinates?.latitude),
    longitude: Number(cordinates?.longitude),
  });
}
