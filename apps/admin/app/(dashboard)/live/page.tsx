// app/(dashboard)/live/page.tsx (Server Component)
import { database } from "../../../database/config";
import SchoolTrackingMap from "./SchoolTrackingMap";

export default async function LiveTrackingPage() {
  // Get today's date in the format your API expects
  const today = new Date();

  // Get active daily rides for today
  const activeRides = await database
    .selectFrom("daily_ride")
    .innerJoin("ride", "daily_ride.rideId", "ride.id")
    .innerJoin("student", "ride.studentId", "student.id")
    .innerJoin("vehicle", "ride.vehicleId", "vehicle.id")
    .innerJoin("user as driver", "ride.driverId", "driver.id")
    .select([
      "daily_ride.id",
      "daily_ride.status",
      "daily_ride.date",
      "daily_ride.kind",
      "ride.id as rideId",
      "student.id as studentId",
      "student.name as studentName",
      "student.address as studentAddress",
      "vehicle.id as vehicleId",
      "vehicle.registration_number as vehicleReg",
      "vehicle.available_seats",
      "driver.id as driverId",
      "driver.name as driverName",
      "driver.phone_number as driverPhone",
      "driver.email as driverEmail",
    ])
    .where("daily_ride.status", "=", "Ongoing")
    .where("daily_ride.date", "=", today)
    .where("driver.kind", "=", "Driver")
    .execute();

  // Get latest driver locations for active rides
  const driverIds = [...new Set(activeRides.map((ride) => ride.driverId))];

  const locations = await Promise.all(
    driverIds.map(async (driverId) => {
      const location = await database
        .selectFrom("location")
        .innerJoin("user as driver", "location.driverId", "driver.id")
        .select([
          "location.id",
          "location.latitude",
          "location.longitude",
          "location.timestamp",
          "location.driverId",
          "driver.name as driverName",
          "driver.phone_number as driverPhone",
        ])
        .where("location.driverId", "=", driverId)
        .orderBy("location.timestamp", "desc")
        .limit(1)
        .executeTakeFirst();

      return location;
    })
  );

  const validLocations = locations.filter((loc) => loc !== undefined);

  return (
    <SchoolTrackingMap active_rides={activeRides} locations={validLocations} />
  );
}
