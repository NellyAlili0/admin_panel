// pages/api/stream-drivers.ts
import { db, sql } from "@repo/database";


export async function GET(req: Request) {
  // check cordinates in the last 10 minutes
  let last_10_minutes = new Date(new Date().getTime() - 1 * 60 * 60 * 1000);
  let cordinates = await db.selectFrom('location')
    .leftJoin('daily_ride', 'daily_ride.id', 'location.daily_ride_id')
    .leftJoin('user', 'user.id', 'daily_ride.driver_id')
    .leftJoin('vehicle', 'vehicle.user_id', 'user.id')
    .select([
      'latitude',
      'longitude',
      'user.name',
      'user.email',
      'user.phone_number',
      'user.id as driver_id',
      'vehicle.id as vehicle_id',
      'vehicle.vehicle_name as vehicle_name',
      'vehicle.registration_number',
      'vehicle.seat_count',
      'vehicle.available_seats'
    ])
    // today
    // .where('location.created_at', '>=', new Date())
    .execute();

  let drivers: any = [];
  cordinates.forEach((cordinate: any) => {
    drivers.push({
      id: cordinate.driver_id,
      name: cordinate.name,
      email: cordinate.email,
      phone_number: cordinate.phone_number,
      vehicle_id: cordinate.vehicle_id,
      vehicle_name: cordinate.vehicle_name,
      registration_number: cordinate.registration_number,
      seat_count: cordinate.seat_count,
      available_seats: cordinate.available_seats,
      location: {
        lat: Number(cordinate.latitude),
        lng: Number(cordinate.longitude)
      }
    })
  })
  return Response.json(drivers)
}

let responseSample = {
  id: "1",
  name: "Driver 1",
  email: "driver1@gmail.com",
  phone_number: "08123456789",
  vehicle_id: "1",
  vehicle_name: "Vehicle 1",
  registration_number: "123456",
  seat_count: 5,
  available_seats: 2,
  location: {
    lat: 4.9022,
    lng: 7.9022
  }
}