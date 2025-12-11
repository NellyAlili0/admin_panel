"use server";
import { database } from "@/database/config";

// ==========================================
// REASSIGN ALL RIDES FROM ONE DRIVER TO ANOTHER
// ==========================================
interface ReassignAllDriverRidesParams {
  oldDriverId: number;
  newDriverId: number;
}

export async function reassignAllDriverRides({
  oldDriverId,
  newDriverId,
}: ReassignAllDriverRidesParams) {
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
      .select([
        "id",
        "vehicle_name",
        "registration_number",
        "seat_count",
        "available_seats",
      ])
      .where("userId", "=", newDriverId)
      .where("status", "=", "Active")
      .executeTakeFirst();

    if (!newVehicle) {
      return {
        success: false,
        message: "New driver has no active vehicle",
      };
    }

    // 3. Get old driver's vehicle to restore seats
    const oldVehicle = await database
      .selectFrom("vehicle")
      .select(["id", "available_seats"])
      .where("userId", "=", oldDriverId)
      .where("status", "=", "Active")
      .executeTakeFirst();

    // 4. Count rides being reassigned
    const ridesToReassign = await database
      .selectFrom("ride")
      .select(["id"])
      .where("driverId", "=", oldDriverId)
      .where("status", "in", ["Ongoing", "Requested", "Pending"])
      .execute();

    const rideCount = ridesToReassign.length;

    if (rideCount === 0) {
      return {
        success: false,
        message: "No active rides found for the old driver",
      };
    }

    // 5. Check if new vehicle has enough seats
    if (newVehicle.available_seats < rideCount) {
      return {
        success: false,
        message: `New vehicle only has ${newVehicle.available_seats} available seats, but ${rideCount} rides need to be reassigned`,
      };
    }

    // 6. Update all rides
    await database
      .updateTable("ride")
      .set({
        driverId: newDriverId,
        vehicleId: newVehicle.id,
        updated_at: new Date(),
      })
      .where("driverId", "=", oldDriverId)
      .where("status", "in", ["Ongoing", "Requested", "Pending"])
      .execute();

    // 7. Update all daily_rides
    await database
      .updateTable("daily_ride")
      .set({
        driverId: newDriverId,
        vehicleId: newVehicle.id,
        updated_at: new Date(),
      })
      .where("driverId", "=", oldDriverId)
      .where("status", "in", ["Ongoing", "Inactive"])
      .execute();

    // 8. Update vehicle seat counts
    // Restore seats to old vehicle
    if (oldVehicle) {
      await database
        .updateTable("vehicle")
        .set({
          available_seats: oldVehicle.available_seats + rideCount,
        })
        .where("id", "=", oldVehicle.id)
        .execute();
    }

    // Reduce seats from new vehicle
    await database
      .updateTable("vehicle")
      .set({
        available_seats: newVehicle.available_seats - rideCount,
      })
      .where("id", "=", newVehicle.id)
      .execute();

    // 9. Get all affected students and parents for notifications
    const affectedRides = await database
      .selectFrom("ride")
      .innerJoin("student", "ride.studentId", "student.id")
      .select([
        "ride.id",
        "ride.parentId",
        "student.id as studentId",
        "student.name as studentName",
      ])
      .where("ride.driverId", "=", newDriverId)
      .where(
        "ride.id",
        "in",
        ridesToReassign.map((r) => r.id)
      )
      .execute();

    return {
      success: true,
      message: `Successfully reassigned ${rideCount} rides from old driver to ${newDriver.name}`,
      ridesReassigned: rideCount,
    };
  } catch (error) {
    console.error("Error reassigning driver:", error);
    return {
      success: false,
      message: "Failed to reassign driver",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ==========================================
// REASSIGN A SINGLE RIDE
// ==========================================
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
    console.error("Error reassigning single ride:", error);
    return {
      success: false,
      message: "Failed to reassign ride",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
