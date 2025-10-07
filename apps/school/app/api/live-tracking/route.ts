import { database, sql } from "@/database/config";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const school_id = searchParams.get("schoolId");

  if (!school_id) {
    return NextResponse.json({
      success: false,
      activeRides: [],
      locations: [],
      students: [],
    });
  }

  const schoolId = parseInt(school_id, 10);
  if (isNaN(schoolId)) {
    return NextResponse.json({
      success: false,
      activeRides: [],
      locations: [],
      students: [],
    });
  }

  try {
    // Fetch all students in that school
    const students = await database
      .selectFrom("student")
      .select([
        "student.id",
        "student.name",
        "student.address",
        "student.schoolId",
      ])
      .where("student.schoolId", "=", schoolId)
      .execute();

    // Get active daily rides for today for students in this school
    const today = new Date();

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
      .where("student.schoolId", "=", schoolId)
      .where("daily_ride.status", "=", "Ongoing")
      .where("daily_ride.date", "=", today)
      .where("driver.kind", "=", "Driver")
      .execute();

    const driverIds = [...new Set(activeRides.map((ride) => ride.driverId))];

    // Get latest location for each driver
    const locations = await Promise.all(
      driverIds.map(async (driverId) => {
        const location = await database
          .selectFrom("location")
          .innerJoin("user as driver", "location.driverId", "driver.id")
          .select([
            "location.id",
            "location.latitude",
            "location.longitude",
            sql`location.timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Nairobi'`.as(
              "timestamp_nairobi"
            ),
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

    const validLocations = locations.filter(
      (loc) => loc !== null && loc !== undefined
    );
    console.log(
      `📍 Found locations for ${validLocations.length} out of ${driverIds.length} drivers`
    );

    console.log("- Active rides:", activeRides.length);

    return NextResponse.json({
      success: true,
      activeRides,
      locations: validLocations,
      students,
    });
  } catch (error) {
    console.error("❌ Error fetching active rides:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch live tracking data" },
      { status: 500 }
    );
  }
}
