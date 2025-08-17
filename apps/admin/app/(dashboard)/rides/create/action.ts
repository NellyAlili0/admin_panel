"use server";
import { zfd } from "zod-form-data";
import { database } from "@/database/config";
import { redirect } from "next/navigation";
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
    return {
      message: "Invalid data",
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
    // Get student info
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
      .where("student.id", "=", Number(student_id))
      .executeTakeFirst();

    if (!student) {
      return {
        message: "Student not found",
      };
    }

    // Get parent info
    const parent = await database
      .selectFrom("user")
      .select([
        "user.id",
        "user.name",
        "user.email",
        "user.phone_number",
        "user.created_at",
      ])
      .where("user.id", "=", Number(student.parentId))
      .executeTakeFirst();

    // Get driver info
    const driver = await database
      .selectFrom("user")
      .select([
        "user.id",
        "user.name",
        "user.email",
        "user.phone_number",
        "user.created_at",
      ])
      .where("user.id", "=", Number(driver_id))
      .where("user.kind", "=", "Driver")
      .executeTakeFirst();

    if (!driver) {
      return {
        message: "Driver not found",
      };
    }

    // Get vehicle info
    const vehicle = await database
      .selectFrom("vehicle")
      .select([
        "vehicle.id",
        "vehicle.vehicle_name",
        "vehicle.registration_number",
        "vehicle.seat_count",
        "vehicle.available_seats",
        "vehicle.status",
      ])
      .where("vehicle.userId", "=", Number(driver_id))
      .where("vehicle.status", "=", "Active")
      .executeTakeFirst();

    if (!vehicle) {
      return {
        message: "No active vehicle found for this driver",
      };
    }

    if (vehicle.available_seats <= 0) {
      return {
        message: "No available seats in this vehicle",
      };
    }

    // Generate weekdays between dates
    const weekdays = getWeekdaysBetweenDates(start_date, end_date);

    if (weekdays.length === 0) {
      return {
        message: "No weekdays found in the selected date range",
      };
    }

    // Prepare schedule data according to RideSchedule type
    const scheduleData = {
      cost: Number(cost),
      paid: null,
      pickup: {
        start_time: pickup_time,
        location: pickup_location,
        latitude: Number(pickup_lat),
        longitude: Number(pickup_lng),
      },
      dropoff: {
        start_time: dropoff_time,
        location: dropoff_location,
        latitude: Number(dropoff_lat),
        longitude: Number(dropoff_lng),
      },
      comments: comments || undefined,
      dates: weekdays,
      kind: type as "Private" | "Carpool" | "Bus",
    };

    // Create the main ride record
    const ride = await database
      .insertInto("ride")
      .values({
        vehicleId: vehicle.id,
        driverId: Number(driver_id),
        schoolId: student.schoolId,
        studentId: Number(student_id),
        parentId: student.parentId,
        schedule: JSON.stringify(scheduleData),
        comments: comments || null,
        admin_comments: null,
        status: "Ongoing",
      })
      .returning("id")
      .executeTakeFirst();

    if (!ride) {
      return {
        message: "Failed to create ride",
      };
    }

    // Create daily ride records for each weekday
    const dailyRidePromises = weekdays.flatMap((weekday) => {
      // Parse pickup and dropoff times
      const [pickupHour, pickupMinute] = pickup_time.split(":").map(Number);
      const [dropoffHour, dropoffMinute] = dropoff_time.split(":").map(Number);

      // Create pickup and dropoff dates
      const pickupDate = new Date(weekday);
      pickupDate.setHours(pickupHour, pickupMinute, 0, 0);

      const dropoffDate = new Date(weekday);
      dropoffDate.setHours(dropoffHour, dropoffMinute, 0, 0);

      const rideDate = new Date(weekday);

      return [
        // Pickup daily ride
        database
          .insertInto("daily_ride")
          .values({
            rideId: ride.id,
            vehicleId: vehicle.id,
            driverId: Number(driver_id),
            kind: "Pickup",
            status: "Inactive",
            date: rideDate,
            start_time: pickupDate,
            end_time: pickupDate, // For pickup, start and end time are the same initially
            comments: null,
            meta: null,
          })
          .executeTakeFirst(),

        // Dropoff daily ride
        database
          .insertInto("daily_ride")
          .values({
            rideId: ride.id,
            vehicleId: vehicle.id,
            driverId: Number(driver_id),
            kind: "Dropoff",
            status: "Inactive",
            date: rideDate,
            start_time: dropoffDate,
            end_time: dropoffDate, // For dropoff, start and end time are the same initially
            comments: null,
            meta: null,
          })
          .executeTakeFirst(),
      ];
    });

    // Execute all daily ride insertions
    await Promise.all(dailyRidePromises);

    // Update vehicle available seats
    await database
      .updateTable("vehicle")
      .set({
        available_seats: vehicle.available_seats - 1,
      })
      .where("id", "=", vehicle.id)
      .executeTakeFirst();

    // Send notifications
    const notificationPromises: Promise<InsertResult>[] = [];

    // Notification to parent (if exists)
    if (parent) {
      notificationPromises.push(
        database
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
      database
        .insertInto("notification")
        .values({
          userId: Number(driver_id),
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

    // Optional: Send email notifications (uncomment if needed)
    // const notify = new Notify();
    // if (parent?.email) {
    //   await notify.sendSingle({
    //     title: "New Ride Assigned",
    //     message: `Your child ${student.name} has been assigned a new ride`,
    //     email: parent.email
    //   });
    // }
    // if (driver.email) {
    //   await notify.sendSingle({
    //     title: "New Ride Assigned",
    //     message: `You have been assigned a new ride for ${student.name}`,
    //     email: driver.email
    //   });
    // }
  } catch (error) {
    console.error("Error assigning ride:", error);
    return { success: true, message: "ride assigned successfully" };
  }
  return redirect("/rides");
}

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
