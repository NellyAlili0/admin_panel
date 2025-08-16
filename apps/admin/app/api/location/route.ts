import { database, sql } from "@/database/config";

export async function GET(req: Request) {
  // Check coordinates in the last 10 minutes
  let coordinates = await database
    .selectFrom("location")
    .select(["latitude", "longitude"])
    .where("location.daily_rideId", "=", 1)
    .where(
      sql<boolean>`"location"."timestamp" >= NOW() - INTERVAL '10 minutes'`
    )
    .executeTakeFirst();

  return Response.json({
    latitude: coordinates ? Number(coordinates.latitude) : 0,
    longitude: coordinates ? Number(coordinates.longitude) : 0,
  });
}
