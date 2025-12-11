"use server";
import { database } from "@/database/config";

interface ReassignSingleRideParams {
  rideId: number;
  oldDriverId: number;
  newDriverId: number;
}

export async function reassignSingleRide({
  rideId,
  oldDriverId,
  newDriverId,
}: ReassignSingleRideParams) {
  try {
    // 1. Verify new driver exists and is active
    const newDriver = await database
      .selectFrom("user")
      .select(["id", "name", "kind"])
      .where("id", "=", newDriverId)
      .where("kind", "=", "Driver")
      .executeTakeFirst();

    if (!newDriver) {
      return {
        success: false,
        message: "New driver not found or is not a driver",
      };
    }

    // 2. Get new driver's active vehicle
    const newVehicle = await database
      .selectFrom("vehicle")
      .select(["id", "vehicle_name", "registration_number", "available_seats"])
      .where("userId", "=", newDriverId)
      .where("status", "=", "Active")
      .executeTakeFirst();

    if (!newVehicle) {
      return {
        success: false,
        message: "New driver has no active vehicle",
      };
    }

    if (newVehicle.available_seats <= 0) {
      return {
        success: false,
        message: "New driver's vehicle has no available seats",
      };
    }

    // 3. Get old driver's vehicle to restore seat
    const oldVehicle = await database
      .selectFrom("vehicle")
      .select(["id", "available_seats"])
      .where("userId", "=", oldDriverId)
      .where("status", "=", "Active")
      .executeTakeFirst();

    // 4. Get ride info for notifications
    const ride = await database
      .selectFrom("ride")
      .innerJoin("student", "ride.studentId", "student.id")
      .select([
        "ride.id",
        "ride.parentId",
        "ride.status",
        "student.name as studentName",
      ])
      .where("ride.id", "=", rideId)
      .where("ride.driverId", "=", oldDriverId)
      .executeTakeFirst();

    if (!ride) {
      return {
        success: false,
        message: "Ride not found or doesn't belong to the old driver",
      };
    }

    if (
      ride.status !== "Ongoing" &&
      ride.status !== "Requested" &&
      ride.status !== "Pending"
    ) {
      return {
        success: false,
        message: `Cannot reassign ride with status: ${ride.status}`,
      };
    }

    // 5. Update the ride
    await database
      .updateTable("ride")
      .set({
        driverId: newDriverId,
        vehicleId: newVehicle.id,
        updated_at: new Date(),
      })
      .where("id", "=", rideId)
      .execute();

    // 6. Update all associated daily_rides
    await database
      .updateTable("daily_ride")
      .set({
        driverId: newDriverId,
        vehicleId: newVehicle.id,
        updated_at: new Date(),
      })
      .where("rideId", "=", rideId)
      .execute();

    // 7. Update vehicle seat counts
    if (oldVehicle) {
      await database
        .updateTable("vehicle")
        .set({
          available_seats: oldVehicle.available_seats + 1,
        })
        .where("id", "=", oldVehicle.id)
        .execute();
    }

    await database
      .updateTable("vehicle")
      .set({
        available_seats: newVehicle.available_seats - 1,
      })
      .where("id", "=", newVehicle.id)
      .execute();

    return {
      success: true,
      message: `Successfully reassigned ride to ${newDriver.name}`,
    };
  } catch (error) {
    console.error("Error reassigning ride:", error);
    return {
      success: false,
      message: "An error occurred while reassigning the ride",
    };
  }
}
