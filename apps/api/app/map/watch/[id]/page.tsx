import { db } from "@repo/database";
import MapWatch from "./details";

export default async function Page({ params }: { params: any }) {
  const { id } = await params;
  const apiKey = process.env.GOOGLE_MAPS_KEY;
  // check ride

  let daily_ride = await db
    .selectFrom("daily_ride")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
  if (!daily_ride) {
    return <div>Ride not found</div>;
  }
  let ride = await db
    .selectFrom("ride")
    .selectAll()
    .where("id", "=", daily_ride.ride_id)
    .executeTakeFirst();

  let driver = await db
    .selectFrom("user")
    .selectAll()
    .where("id", "=", daily_ride.driver_id)
    .executeTakeFirst();

  let vehicle = await db
    .selectFrom("vehicle")
    .selectAll()
    .where("id", "=", daily_ride.vehicle_id)
    .executeTakeFirst();

  let student = await db
    .selectFrom("student")
    .selectAll()
    .where("id", "=", ride?.student_id!)
    .executeTakeFirst();
  // location info
  let location = await db
    .selectFrom("location")
    .selectAll()
    .where("daily_ride_id", "=", id)
    .executeTakeFirst();
  return <MapWatch />;
}
