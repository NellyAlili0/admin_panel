import { db } from "@repo/database";
import MapWatch from "./details";
import RealTimeDriverMap from "./watch";

export default async function Page({ params }: { params: any }) {
  const { id } = await params;
  const apiKey = process.env.GOOGLE_MAPS_KEY;
  // check ride

  let daily_ride = await db
    .selectFrom("daily_ride")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
  if (!daily_ride) {
    return <div>Ride not found</div>;
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
    .where("daily_ride_id", "=", id)
    .executeTakeFirst();

  if (!driver) {
    return <div> Driver is not sharing their location</div>;
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
      />
    </div>
  );
}
