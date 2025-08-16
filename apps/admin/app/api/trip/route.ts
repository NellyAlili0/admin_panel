import { database, sql } from "@/database/config";

export async function GET(req: Request) {
  // Check coordinates in the last 10 minutes
  let last_10_minutes = new Date(new Date().getTime() - 10 * 60 * 1000);
  let coordinates = await database
    .selectFrom("location")
    .leftJoin("daily_ride", "daily_ride.id", "location.daily_rideId")
    .leftJoin("user", "user.id", "daily_ride.driverId")
    .leftJoin("vehicle", "vehicle.userId", "user.id")
    .select([
      "latitude",
      "longitude",
      "user.name",
      "user.email",
      "user.phone_number",
      "user.id as driver_id",
      "vehicle.id as vehicle_id",
      "vehicle.vehicle_name as vehicle_name",
      "vehicle.registration_number",
      "vehicle.seat_count",
      "vehicle.available_seats",
    ])
    .where("location.timestamp", ">=", last_10_minutes)
    .execute();

  let drivers: any = [];
  coordinates.forEach((coordinate: any) => {
    drivers.push({
      id: coordinate.driver_id,
      name: coordinate.name,
      email: coordinate.email,
      phone_number: coordinate.phone_number,
      vehicle_id: coordinate.vehicle_id,
      vehicle_name: coordinate.vehicle_name,
      registration_number: coordinate.registration_number,
      seat_count: coordinate.seat_count,
      available_seats: coordinate.available_seats,
      location: {
        lat: Number(coordinate.latitude),
        lng: Number(coordinate.longitude),
      },
    });
  });

  return Response.json(drivers);
}
