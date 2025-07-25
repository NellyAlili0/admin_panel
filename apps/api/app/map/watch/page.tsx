import { db } from "@repo/database";
import RealTimeDriverMap from "./watch";

export default async function Page({ searchParams }: { searchParams: any }) {
  // const { id } = await params;
  const { kind, email, parent } = await searchParams;
  const apiKey = process.env.GOOGLE_MAPS_KEY;
  // check ride
  let user = await db
    .selectFrom("user")
    .select(["user.id", "user.email"])
    .where("user.email", "=", email)
    .executeTakeFirst();
  let daily_ride;
  if (kind == "parent") {
    // check if active or started
    daily_ride = await db
      .selectFrom("daily_ride")
      .leftJoin("ride", "daily_ride.ride_id", "ride.id")
      .select(["daily_ride.id", "daily_ride.ride_id", "daily_ride.driver_id"])
      .where("ride.parent_id", "=", user?.id!)
      .where((eb) =>
        eb.or([
          eb("daily_ride.status", "=", "Active"),
          eb("daily_ride.status", "=", "Started"),
          eb("daily_ride.status", "=", "Finished"),
        ])
      )
      .executeTakeFirst();
  } else if (kind == "driver") {
    daily_ride = await db
      .selectFrom("daily_ride")
      .leftJoin("user", "daily_ride.driver_id", "user.id")
      .select(["daily_ride.id", "daily_ride.ride_id", "daily_ride.driver_id"])
      .where("daily_ride.driver_id", "=", user?.id!)
      .where((eb) =>
        eb.or([
          eb("daily_ride.status", "=", "Active"),
          eb("daily_ride.status", "=", "Started"),
        ])
      )
      .executeTakeFirst();
  }
  if (!daily_ride) {
    return <div className="h-screen w-screen flex flex-col items-center justify-center">Ride not found</div>;
  }
  let ride = await db
    .selectFrom("ride")
    .selectAll()
    .where("id", "=", daily_ride.ride_id)
    .executeTakeFirst();
  let pickup = {
    lat: Number(ride?.schedule?.pickup.latitude!),
    lng: Number(ride?.schedule?.pickup.longitude!),
  };
  let dropoff = {
    lat: Number(ride?.schedule?.dropoff.latitude!),
    lng: Number(ride?.schedule?.dropoff.longitude!),
  };
  // driver, check for last known location on the table
  let driver = await db
    .selectFrom("location")
    .select(["latitude", "longitude"])
    .where("daily_ride_id", "=", daily_ride.id)
    .executeTakeFirst();

  if (!driver) {
    return <div className="h-screen w-screen flex flex-col items-center justify-center">Driver is not sharing their location</div>;
  }
  let initialDriverLocation = {
    lat: Number(driver.latitude),
    lng: Number(driver.longitude),
  };

  return (
    <div className="h-screen w-screen">
      <RealTimeDriverMap
        pickupLocations={[pickup]}
        finalDestination={dropoff}
        initialDriverLocation={initialDriverLocation}
        daily_ride_id={daily_ride.id}
        kind={kind}
      />
    </div>
  );
}
