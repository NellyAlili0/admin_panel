import { Auth } from "@repo/handlers/auth";
import { db, sql } from "@repo/database";

export async function POST(req: Request) {
  const auth = new Auth();
  const payload = auth.checkApiToken({ req });
  if (!payload) {
    return Response.json(
      {
        status: "error",
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }
  // get the next ride today.
  let today: any = formatDate(new Date());
  const rides = await db
    .selectFrom("daily_ride")
    .leftJoin("ride", "daily_ride.ride_id", "ride.id")
    .leftJoin("student", "ride.student_id", "student.id")
    .leftJoin("user", "daily_ride.driver_id", "user.id")
    .leftJoin("vehicle", "daily_ride.vehicle_id", "vehicle.id")
    .select([
      "daily_ride.id",
      "student.name as passenger",
      "student.id as passenger_id",
      "student.parent_id",
      "student.gender",
      "user.name as driver_name",
      "user.phone_number as driver_phone",
      "daily_ride.kind",
      "vehicle.vehicle_name",
      "vehicle.registration_number",
      "daily_ride.start_time",
      "daily_ride.end_time",
      "daily_ride.kind",
      "daily_ride.status",
    ])
    .where("daily_ride.driver_id", "=", payload.id)
    .where("daily_ride.date", "=", today)
    .orderBy("daily_ride.start_time", "asc")
    .execute();
  let total_trips: any =
    await sql`SELECT COUNT(*) as total FROM daily_ride WHERE driver_id = ${payload.id};`.execute(
      db
    );
  total_trips = total_trips.rows[0]["total"];
  let upcoming: any =
    await sql`SELECT COUNT(*) as total FROM daily_ride WHERE driver_id = ${payload.id} AND date > ${today};`.execute(
      db
    );
  upcoming = upcoming.rows[0]["total"];
  // count pickups,
  // count dropoffs
  let pickups = rides.filter((ride) => ride.kind === "Pickup").length;
  let dropoffs = rides.filter((ride) => ride.kind === "Dropoff").length;
  return Response.json(
    {
      status: "success",
      rides,
      total_trips,
      upcoming,
      pickups,
      dropoffs,
    },
    { status: 200 }
  );
}

function formatDate(date: Date) {
  return new Date(date).toISOString().split("T")[0];
}
