// app/(dashboard)/live/page.tsx (Server Component)
import { database, sql } from "../../../database/config";
import SchoolTrackingMapWrapper from "./SchoolTrackingMapWrapper";

// Helper function to get today's date in Nairobi timezone
const getCurrentDateInNairobi = () => {
  const today = new Date();
  const nairobiDate = today.toLocaleDateString("en-CA", {
    // YYYY-MM-DD format
    timeZone: "Africa/Nairobi",
  });
  return new Date(nairobiDate);
};

export default async function LiveTrackingPage() {
  const todayInNairobi = getCurrentDateInNairobi();

  try {
    // Get students data
    const students = await database
      .selectFrom("student")
      .select([
        "student.id",
        "student.name",
        "student.address",
        "student.schoolId",
      ])
      .execute();

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
      .where("daily_ride.date", "=", todayInNairobi)
      .where("driver.kind", "=", "Driver")
      .execute();

    console.log(
      `📊 Found ${activeRides.length} active rides for ${todayInNairobi.toISOString().split("T")[0]}`
    );

    // Extract unique driver IDs from active rides
    const driverIds = [...new Set(activeRides.map((ride) => ride.driverId))];
    console.log(
      `👥 Tracking ${driverIds.length} unique drivers: ${driverIds.join(", ")}`
    );

    // Fetch the latest driver location for each active driver
    const locations = await Promise.all(
      driverIds.map(async (driverId) => {
        try {
          const location = await database
            .selectFrom("location")
            .innerJoin("user as driver", "location.driverId", "driver.id")
            .select([
              "location.id",
              "location.latitude",
              "location.longitude",
              // Convert timestamp to Nairobi time directly in the query
              sql`location.timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Nairobi'`.as(
                "timestamp_nairobi"
              ),
              // Keep original timestamp if needed for comparison/debugging
              "location.timestamp",
              "location.driverId",
              "driver.name as driverName",
              "driver.phone_number as driverPhone",
            ])
            .where("location.driverId", "=", driverId)
            .orderBy("location.timestamp", "desc")
            .limit(1)
            .executeTakeFirst();

          if (location) {
            console.log(
              `📍 Driver ${driverId} last location: ${location.latitude}, ${location.longitude} at ${location.timestamp_nairobi} (Nairobi)`
            );
          } else {
            console.warn(`⚠️ No location found for driver ${driverId}`);
          }

          return location;
        } catch (error) {
          console.error(
            `❌ Error fetching location for driver ${driverId}:`,
            error
          );
          return null;
        }
      })
    );

    // Filter out any null locations (in case a driver has no location data)
    const validLocations = locations.filter(
      (loc) => loc !== null && loc !== undefined
    );
    console.log(
      `📍 Found locations for ${validLocations.length} out of ${driverIds.length} drivers`
    );

    // Debug log for timezone handling
    console.log("🕐 Server timezone info:");
    console.log("- Server time:", new Date().toISOString());
    console.log("- Nairobi date:", todayInNairobi.toISOString());
    console.log("- Active rides:", activeRides.length);

    return (
      <div className="w-full h-screen">
        <SchoolTrackingMapWrapper
          students={students}
          active_rides={activeRides}
          locations={validLocations}
        />
      </div>
    );
  } catch (error) {
    console.error("❌ Error in LiveTrackingPage:", error);

    // Return error page instead of crashing
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-2">
            Error Loading Live Tracking
          </div>
          <div className="text-sm text-gray-600 mb-4">
            Failed to load tracking data. Please try refreshing the page.
          </div>
          <div className="text-xs text-gray-400">
            Check console for detailed error information.
          </div>
        </div>
      </div>
    );
  }
}
