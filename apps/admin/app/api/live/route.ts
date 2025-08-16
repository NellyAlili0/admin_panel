import { database } from "@/database/config";

export async function GET(req: Request) {
  let drivers = await database
    .selectFrom("daily_ride")
    .leftJoin("user", "daily_ride.driverId", "user.id")
    .leftJoin("vehicle", "vehicle.userId", "user.id")
    .select([
      "user.email",
      "user.phone_number",
      "user.name",
      "vehicle.vehicle_name as vehicle_name",
      "vehicle.registration_number",
    ])
    .distinctOn("user.email")
    .where((eb) => eb.or([eb("daily_ride.status", "=", "Started")]))
    .execute();

  let allDriverInfo: any = [];
  for (let driver of drivers) {
    let lastLocation = await database
      .selectFrom("location")
      .leftJoin("daily_ride", "location.daily_rideId", "daily_ride.id")
      .leftJoin("user", "daily_ride.driverId", "user.id")
      .select(["latitude", "longitude"])
      .where("user.email", "=", driver.email)
      .executeTakeFirst();

    if (lastLocation) {
      lastLocation.latitude = Number(lastLocation.latitude);
      lastLocation.longitude = Number(lastLocation.longitude);
    } else {
      lastLocation = {
        latitude: 0,
        longitude: 0,
      };
    }

    const { count } = await database
      .selectFrom("daily_ride")
      .leftJoin("user", "daily_ride.driverId", "user.id")
      .select(database.fn.countAll().as("count"))
      .where("user.email", "=", driver.email)
      .executeTakeFirstOrThrow();

    allDriverInfo.push({
      ...driver,
      lastLocation: lastLocation || { latitude: 0, longitude: 0 },
      passengerCount: count,
    });
  }

  return Response.json(allDriverInfo);
}
