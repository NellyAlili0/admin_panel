"use server";
import { zfd } from "zod-form-data";
import { database } from "@/database/config";
import { Notify } from "@repo/handlers/notify";
import { InsertResult } from "kysely";

const assignRideSchema = zfd.formData({
  driver_id: zfd.text(),
  student_id: zfd.text(),
  pickup_location: zfd.text(),
  pickup_time: zfd.text(),
  pickup_lat: zfd.text(),
  pickup_lng: zfd.text(),
  dropoff_location: zfd.text(),
  dropoff_time: zfd.text(),
  dropoff_lat: zfd.text(),
  dropoff_lng: zfd.text(),
  start_date: zfd.text(),
  end_date: zfd.text(),
  type: zfd.text(),
  cost: zfd.text(),
  comments: zfd.text(),
});

export async function assignRide(formData: FormData) {
  const data = assignRideSchema.safeParse(formData);
  if (!data.success) {
    console.error("Validation errors:", data.error.flatten());
    return {
      success: false,
      message:
        "Invalid data: " + data.error.issues.map((i) => i.message).join(", "),
    };
  }

  const {
    driver_id,
    student_id,
    pickup_location,
    pickup_time,
    pickup_lat,
    pickup_lng,
    dropoff_location,
    dropoff_time,
    dropoff_lat,
    dropoff_lng,
    start_date,
    end_date,
    type,
    cost,
    comments,
  } = data.data;

  try {
    // Validate IDs are numeric
    const driverIdNum = Number(driver_id);
    const studentIdNum = Number(student_id);
    const costNum = Number(cost);

    if (isNaN(driverIdNum) || isNaN(studentIdNum) || isNaN(costNum)) {
      return {
        success: false,
        message: "Invalid driver ID, student ID, or cost format",
      };
    }

    if (costNum <= 0) {
      return {
        success: false,
        message: "Cost must be greater than 0",
      };
    }

    // Validate date format and logic
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return {
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD format.",
      };
    }

    if (startDate > endDate) {
      return {
        success: false,
        message: "Start date must be before end date",
      };
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(pickup_time) || !timeRegex.test(dropoff_time)) {
      return {
        success: false,
        message: "Invalid time format. Use HH:MM format (e.g., 07:30, 15:45)",
      };
    }

    // Validate ride type
    if (!["Private", "Carpool", "Bus"].includes(type)) {
      return {
        success: false,
        message: "Invalid ride type. Must be Private, Carpool, or Bus",
      };
    }

    // Get student info with transaction safety
    const student = await database
      .selectFrom("student")
      .select([
        "student.id",
        "student.name",
        "student.gender",
        "student.address",
        "student.comments",
        "student.parentId",
        "student.schoolId",
      ])
      .where("student.id", "=", studentIdNum)
      .executeTakeFirst();

    if (!student) {
      return {
        success: false,
        message: `Student with ID ${student_id} not found`,
      };
    }

    // Check if student already has an active ride
    const existingRide = await database
      .selectFrom("ride")
      .select("id")
      .where("studentId", "=", studentIdNum)
      .where("status", "in", ["Ongoing", "Pending"])
      .executeTakeFirst();

    if (existingRide) {
      return {
        success: false,
        message: `Student ${student.name} already has an active ride`,
      };
    }

    // Get parent info
    let parent = null;
    if (student.parentId) {
      parent = await database
        .selectFrom("user")
        .select([
          "user.id",
          "user.name",
          "user.email",
          "user.phone_number",
          "user.created_at",
        ])
        .where("user.id", "=", student.parentId)
        .executeTakeFirst();
    }

    // Get driver info with vehicle details
    const driver = await database
      .selectFrom("user")
      .leftJoin("vehicle", "user.id", "vehicle.userId")
      .select([
        "user.id",
        "user.name",
        "user.email",
        "user.phone_number",
        "user.created_at",
        "vehicle.id as vehicle_id",
        "vehicle.vehicle_name",
        "vehicle.registration_number",
        "vehicle.seat_count",
        "vehicle.available_seats",
        "vehicle.status as vehicle_status",
      ])
      .where("user.id", "=", driverIdNum)
      .where("user.kind", "=", "Driver")
      .executeTakeFirst();

    if (!driver) {
      return {
        success: false,
        message: `Driver with ID ${driver_id} not found`,
      };
    }

    if (!driver.vehicle_id) {
      return {
        success: false,
        message: `Driver ${driver.name} has no vehicle assigned`,
      };
    }

    if (driver.vehicle_status !== "Active") {
      return {
        success: false,
        message: `Driver ${driver.name}'s vehicle is not active`,
      };
    }

    if (driver.available_seats <= 0) {
      return {
        success: false,
        message: `No available seats in ${driver.name}'s vehicle (${driver.available_seats}/${driver.seat_count})`,
      };
    }

    // Validate coordinates
    const pickupLatNum = Number(pickup_lat);
    const pickupLngNum = Number(pickup_lng);
    const dropoffLatNum = Number(dropoff_lat);
    const dropoffLngNum = Number(dropoff_lng);

    if (
      isNaN(pickupLatNum) ||
      isNaN(pickupLngNum) ||
      isNaN(dropoffLatNum) ||
      isNaN(dropoffLngNum)
    ) {
      return {
        success: false,
        message: "Invalid coordinate format",
      };
    }

    // Generate weekdays between dates
    const weekdays = getWeekdaysBetweenDates(start_date, end_date);

    if (weekdays.length === 0) {
      return {
        success: false,
        message: "No weekdays found in the selected date range",
      };
    }

    // Start transaction
    const result = await database.transaction().execute(async (trx) => {
      // Prepare schedule data according to RideSchedule type
      const scheduleData = {
        cost: costNum,
        paid: null,
        pickup: {
          start_time: pickup_time,
          location: pickup_location,
          latitude: pickupLatNum,
          longitude: pickupLngNum,
        },
        dropoff: {
          start_time: dropoff_time,
          location: dropoff_location,
          latitude: dropoffLatNum,
          longitude: dropoffLngNum,
        },
        comments: comments || undefined,
        dates: weekdays,
        kind: type as "Private" | "Carpool" | "Bus",
      };

      // Create the main ride record
      const ride = await trx
        .insertInto("ride")
        .values({
          vehicleId: driver.vehicle_id,
          driverId: driverIdNum,
          schoolId: student.schoolId,
          studentId: studentIdNum,
          parentId: student.parentId,
          schedule: JSON.stringify(scheduleData),
          comments: comments || null,
          admin_comments: null,
          status: "Ongoing",
        })
        .returning("id")
        .executeTakeFirst();

      if (!ride) {
        throw new Error("Failed to create ride record");
      }

      // Create daily ride records for each weekday
      const dailyRidePromises = weekdays.flatMap((weekday) => {
        // Parse pickup and dropoff times
        const [pickupHour, pickupMinute] = pickup_time.split(":").map(Number);
        const [dropoffHour, dropoffMinute] = dropoff_time
          .split(":")
          .map(Number);

        // Create pickup and dropoff dates
        const pickupDate = new Date(weekday);
        pickupDate.setHours(pickupHour, pickupMinute, 0, 0);

        const dropoffDate = new Date(weekday);
        dropoffDate.setHours(dropoffHour, dropoffMinute, 0, 0);

        const rideDate = new Date(weekday);

        return [
          // Pickup daily ride
          trx
            .insertInto("daily_ride")
            .values({
              rideId: ride.id,
              vehicleId: driver.vehicle_id!,
              driverId: driverIdNum,
              kind: "Pickup",
              status: "Inactive",
              date: rideDate,
              start_time: pickupDate,
              end_time: pickupDate,
              comments: null,
              meta: null,
            })
            .executeTakeFirst(),

          // Dropoff daily ride
          trx
            .insertInto("daily_ride")
            .values({
              rideId: ride.id,
              vehicleId: driver.vehicle_id!,
              driverId: driverIdNum,
              kind: "Dropoff",
              status: "Inactive",
              date: rideDate,
              start_time: dropoffDate,
              end_time: dropoffDate,
              comments: null,
              meta: null,
            })
            .executeTakeFirst(),
        ];
      });

      // Execute all daily ride insertions
      await Promise.all(dailyRidePromises);

      // Update vehicle available seats
      await trx
        .updateTable("vehicle")
        .set({
          available_seats: driver.available_seats - 1,
        })
        .where("id", "=", driver.vehicle_id)
        .executeTakeFirst();

      // Send notifications
      const notificationPromises: Promise<InsertResult>[] = [];

      // Notification to parent (if exists)
      if (parent) {
        notificationPromises.push(
          trx
            .insertInto("notification")
            .values({
              userId: parent.id,
              title: "New Ride Assigned",
              message: `Your child ${student.name} has been assigned a new ride with ${driver.name}`,
              is_read: false,
              kind: "Personal",
              section: "Rides",
              meta: null,
            })
            .executeTakeFirst()
        );
      }

      // Notification to driver
      notificationPromises.push(
        trx
          .insertInto("notification")
          .values({
            userId: driverIdNum,
            title: "New Ride Assigned",
            message: `You have been assigned a new ride for student ${student.name}`,
            is_read: false,
            kind: "Personal",
            section: "Rides",
            meta: null,
          })
          .executeTakeFirst()
      );

      // Execute all notifications
      await Promise.all(notificationPromises);

      return {
        success: true,
        rideId: ride.id,
        message: `Ride successfully created for ${student.name} with ${driver.name}`,
      };
    });

    // Optional: Send email notifications (uncomment if needed)
    try {
      const notify = new Notify();
      if (parent?.email) {
        await notify.sendSingle({
          title: "New Ride Assigned",
          message: `Your child ${student.name} has been assigned a new ride with ${driver.name}`,
          email: parent.email,
        });
      }
      if (driver.email) {
        await notify.sendSingle({
          title: "New Ride Assigned",
          message: `You have been assigned a new ride for ${student.name}`,
          email: driver.email,
        });
      }
    } catch (emailError) {
      console.error("Error sending email notifications:", emailError);
      // Don't fail the ride creation if email fails
    }

    return {
      success: true,
      message: `Ride successfully assigned to ${student.name}`,
    };
  } catch (error) {
    console.error("Error assigning ride:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while creating the ride",
    };
  }
}

// Helper function to generate weekdays between dates
function getWeekdaysBetweenDates(
  start_date: string,
  end_date: string
): string[] {
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);

  // Validate dates
  if (startDate > endDate) {
    return [];
  }

  const weekdays: string[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    // Include Monday (1) through Friday (5), exclude Saturday (6) and Sunday (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      weekdays.push(currentDate.toISOString().split("T")[0]); // Format as YYYY-MM-DD
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return weekdays;
}
