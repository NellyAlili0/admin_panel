// actions, start, end, view, history
import { Auth } from "@repo/handlers/auth";
import { db } from "@repo/database";
import { z } from "zod";
import { Notify } from "@repo/handlers/notify";

const schema = z.object({
  action: z.enum([
    "view",
    "history",
    "today",
    "pickup",
    "pickup-all",
    "dropoff",
    "dropoff-all",
  ]),
  trip_id: z.number().optional(),
  trips: z.array(z.number()).optional(),
  ride_id: z.string().optional(),
  date: z.string().optional(),
});

export async function POST(req: Request) {
  const auth = new Auth();
  const payload = auth.checkApiToken({ req });
  if (!payload) {
    return Response.json(
      {
        status: "error",
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  const data = await req.json();
  const check = schema.safeParse(data);

  if (!check.success) {
    return Response.json(
      {
        status: "error",
        message: "Invalid data",
      },
      { status: 400 }
    );
  }

  const { action, trip_id, trips, ride_id, date } = check.data;

  if (action === "today") {
    // get today's rides. Use format to get today's date
    let today: any = formatDate(new Date());
    if (date) {
      today = formatDate(new Date(date));
    }
    const rides = await db
      .selectFrom("daily_ride")
      .leftJoin("ride", "daily_ride.ride_id", "ride.id")
      .leftJoin("student", "ride.student_id", "student.id")
      .leftJoin("user", "daily_ride.driver_id", "user.id")
      .leftJoin("vehicle", "daily_ride.vehicle_id", "vehicle.id")
      .leftJoin("school", "ride.school_id", "school.id")
      .select([
        "daily_ride.id",
        "student.name as passenger",
        "user.name as driver_name",
        "user.phone_number as driver_phone",
        "daily_ride.kind",
        "vehicle.vehicle_name",
        "vehicle.registration_number",
        "school.name",
        "daily_ride.start_time",
        "daily_ride.end_time",
        "daily_ride.kind",
        "daily_ride.status",
      ])
      .where("daily_ride.driver_id", "=", payload.id)
      .where("daily_ride.date", "=", today)
      .orderBy("daily_ride.start_time", "asc")
      .execute();
    let pickup = rides.filter((ride) => ride.kind === "Pickup");
    let dropoff = rides.filter((ride) => ride.kind === "Dropoff");
    return Response.json(
      {
        status: "success",
        rides,
        pickup,
        dropoff,
      },
      { status: 200 }
    );
  } else if (action === "history") {
    let history_trips = await db
      .selectFrom("daily_ride")
      .leftJoin("ride", "daily_ride.ride_id", "ride.id")
      .leftJoin("vehicle", "daily_ride.vehicle_id", "vehicle.id")
      .leftJoin("user", "daily_ride.driver_id", "user.id")
      .leftJoin("student", "ride.student_id", "student.id")
      .select([
        "daily_ride.id",
        "daily_ride.kind",
        "daily_ride.start_time",
        "daily_ride.end_time",
        "ride.comments",
        "vehicle.registration_number",
        "vehicle.vehicle_name",
        "user.name as parent_name",
        "user.phone_number as parent_phone_number",
        "student.name as student_name",
        "student.gender",
        "student.profile_picture",
        "ride.schedule",
        "daily_ride.status",
      ])
      .where("daily_ride.driver_id", "=", payload.id)
      .where("daily_ride.status", "=", "Finished")
      .orderBy("daily_ride.date", "desc")
      .execute();
    return Response.json(
      {
        status: "success",
        trips: history_trips,
      },
      { status: 200 }
    );
  } else if (action === "view") {
    // student trip details and location info
    let trip_details = await db
      .selectFrom("daily_ride")
      .leftJoin("ride", "daily_ride.ride_id", "ride.id")
      .leftJoin("vehicle", "daily_ride.vehicle_id", "vehicle.id")
      .leftJoin("user", "daily_ride.driver_id", "user.id")
      .leftJoin("student", "ride.student_id", "student.id")
      .select([
        "daily_ride.id",
        "daily_ride.kind",
        "daily_ride.start_time",
        "daily_ride.end_time",
        "ride.comments",
        "vehicle.registration_number",
        "vehicle.vehicle_name",
        "user.name as parent_name",
        "user.phone_number as parent_phone_number",
        "student.name as student_name",
        "student.gender",
        "student.profile_picture",
        "ride.schedule",
        "daily_ride.status",
      ])
      .where("daily_ride.id", "=", trip_id!)
      .where("daily_ride.driver_id", "=", payload.id)
      .executeTakeFirst();
    if (!trip_details) {
      return Response.json(
        {
          status: "error",
          message: "Trip not found",
        },
        { status: 404 }
      );
    }
    // get location info
    let locations = await db
      .selectFrom("location")
      .select(["latitude", "longitude", "created_at"])
      .where("daily_ride_id", "=", trip_id!)
      .orderBy("created_at", "asc")
      .execute();
    return Response.json(
      {
        status: "success",
        trip_details,
        locations,
      },
      { status: 200 }
    );
  } else if (action === "pickup") {
    await db
      .updateTable("daily_ride")
      .set({
        status: "Active",
      })
      .where("id", "=", trip_id!)
      .execute();
    await getParentEmailByTripId(trip_id!);
    return Response.json(
      {
        status: "success",
      },
      { status: 200 }
    );
  } else if (action === "pickup-all") {
    // student pickup all
    await db
      .updateTable("daily_ride")
      .set({
        status: "Active",
      })
      .where("id", "in", trips!)
      .execute();
    if (trips) {
      trips.forEach(async (trip_id) => {
        await getParentEmailByTripId(trip_id);
      });
    }
    return Response.json(
      {
        status: "success",
      },
      { status: 200 }
    );
  } else if (action === "dropoff") {
    // student dropoff.
    await db
      .updateTable("daily_ride")
      .set({
        status: "Finished",
      })
      .where("id", "=", trip_id!)
      .execute();
    await getParentEmailByTripId(trip_id!);
    return Response.json(
      {
        status: "success",
      },
      { status: 200 }
    );
  } else if (action === "dropoff-all") {
    // student dropoff all
    await db
      .updateTable("daily_ride")
      .set({
        status: "Finished",
      })
      .where("id", "in", trips!)
      .execute();
    if (trips) {
      trips.forEach(async (trip_id) => {
        await getParentEmailByTripId(trip_id);
      });
    }
    return Response.json(
      {
        status: "success",
      },
      { status: 200 }
    );
  } else {
    return Response.json(
      {
        status: "error",
        message: "Invalid action",
      },
      { status: 400 }
    );
  }
}

async function getParentEmailByTripId(trip_id: number) {
  let trip = await db
    .selectFrom("daily_ride")
    .leftJoin("ride", "daily_ride.ride_id", "ride.id")
    .leftJoin("user", "ride.parent_id", "user.id")
    .select(["user.email", "user.meta", "daily_ride.kind"])
    .where("daily_ride.id", "=", trip_id)
    .executeTakeFirst();
  let notify = new Notify();
  if (trip?.meta) {
    let when_bus_makes_home_drop_off =
      trip.meta?.notifications.when_bus_makes_home_drop_off;
    let when_bus_make_home_pickup =
      trip.meta?.notifications.when_bus_make_home_pickup;
    if (trip.kind == "Pickup") {
      if (when_bus_make_home_pickup) {
        notify.sendSingle({
          title: "Trip Pickup",
          message: "Your trip has been picked up",
          email: trip.email!,
        });
      }
    } else {
      if (when_bus_makes_home_drop_off) {
        notify.sendSingle({
          title: "Trip Dropoff",
          message: "Your trip has been dropped off",
          email: trip.email!,
        });
      }
    }
  }
}

function formatDate(date: Date) {
  return new Date(date).toISOString().split("T")[0];
}
