import { z } from "zod";
import { db } from "@repo/database";

const schema = z.object({
  driver_id: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  timestamp: z.number(),
  kind: z.enum(["pickup", "dropoff"]).optional(),
});

export async function POST(req: Request) {
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

  const { driver_id, latitude, longitude, timestamp, kind } = check.data;

  // find all trips that are active with the current driver id
  const trips = await db
    .selectFrom("daily_ride")
    .leftJoin("user", "daily_ride.driver_id", "user.id")
    .select(["daily_ride.id", "daily_ride.meta"])
    .where("user.email", "=", driver_id)
    .where("daily_ride.kind", "=", kind == "pickup" ? "Pickup" : "Dropoff")
    .where((eb) =>
      eb.or([
        eb("daily_ride.status", "=", "Active"),
        eb("daily_ride.status", "=", "Started"),
      ])
    )
    .execute();

  // check meta
  // if (trips.length > 0) {
  //     let parent_metas = trips.filter((trip) => trip.meta)
  //     for (const parent_meta of parent_metas) {
  //         let meta = parent_meta.meta as {
  //             notifications: {
  //                 point_five_km: boolean,
  //                 one_km: boolean
  //             }
  //         }
  //         if (meta.notifications.point_five_km) {

  //         }
  //         if (meta.notifications.one_km) {

  //         }
  //     }
  // }

  // insert location for each trip
  for (const trip of trips) {
    await db
      .insertInto("location")
      .values({
        daily_ride_id: trip.id,
        latitude,
        longitude,
      })
      .executeTakeFirst();
  }
  // check on the parent ride meta for daily trip to see if email was sent
  return Response.json(
    {
      status: "success",
    },
    { status: 200 }
  );
}
