import { Breadcrumbs } from "@/components/breadcrumbs";
import { database, sql } from "@/database/config";
import { RideDetailsPage } from "./dets";

const getCurrentDateInNairobi = () => {
  const today = new Date();
  const nairobiDate = today.toLocaleDateString("en-CA", {
    // YYYY-MM-DD format
    timeZone: "Africa/Nairobi",
  });
  return new Date(nairobiDate);
};

// Helper function to safely convert database timestamps
const formatTimestamp = (timestamp: any) => {
  if (!timestamp) return "Ride Missed";

  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch (error) {
    return "Error formatting date";
  }
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ride_id = Number(id);

  let ride = await database
    .selectFrom("ride")
    .selectAll()
    .where("id", "=", ride_id)
    .executeTakeFirst();

  if (!ride) {
    return <div>Ride not found</div>;
  }

  let student = await database
    .selectFrom("student")
    .selectAll()
    .where("id", "=", ride.studentId)
    .executeTakeFirst();

  let vehicle = await database
    .selectFrom("vehicle")
    .selectAll()
    .where("id", "=", ride.vehicleId)
    .executeTakeFirst();

  let driver = await database
    .selectFrom("user")
    .selectAll()
    .where("id", "=", ride.driverId)
    .executeTakeFirst();

  let guardian = await database
    .selectFrom("user")
    .selectAll()
    .where("id", "=", ride.parentId)
    .executeTakeFirst();

  const nairobiNow = new Date().toLocaleString("en-US", {
    timeZone: "Africa/Nairobi",
  });
  const todayInNairobi = getCurrentDateInNairobi();

  const tripHistory = await database
    .selectFrom("daily_ride")
    .leftJoin("ride", "ride.id", "daily_ride.rideId")
    .leftJoin("student", "student.id", "ride.studentId")
    .leftJoin("user as driver", "driver.id", "daily_ride.driverId")
    .select([
      "daily_ride.id",
      "daily_ride.kind",
      "student.name as student",
      "driver.name as driver",
      sql`ride.schedule->'pickup'->>'start_time'`.as("pickup_scheduled_time"),
      sql`ride.schedule->'dropoff'->>'start_time'`.as("dropoff_scheduled_time"),
      // Convert timestamps to Nairobi time directly in the query
      sql`daily_ride.embark_time AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Nairobi'`.as(
        "embark_time_nairobi"
      ),
      sql`daily_ride.disembark_time AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Nairobi'`.as(
        "disembark_time_nairobi"
      ),
      // Keep original timestamps for comparison/debugging
      "daily_ride.embark_time",
      "daily_ride.disembark_time",
      sql`ride.schedule->'pickup'->>'location'`.as("pickup_location"),
      sql`ride.schedule->'dropoff'->>'location'`.as("dropoff_location"),
      "daily_ride.status",
      "daily_ride.date",
    ])
    .where("daily_ride.rideId", "=", ride.id)
    .where(({ or, eb }) =>
      or([
        // Previous days
        eb("daily_ride.date", "<", todayInNairobi),
        // Today but before current time (convert UTC to Nairobi time for comparison)
        eb(
          sql`daily_ride.disembark_time AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Nairobi'`,
          "<",
          sql`${nairobiNow}::timestamp`
        ),
      ])
    )
    .orderBy(
      sql`COALESCE(daily_ride.disembark_time, daily_ride.embark_time, daily_ride.date)`,
      "desc"
    )
    .execute();

  // Transform the data to match your required fields structure
  const formattedTripHistory = tripHistory.map((trip) => ({
    id: trip.id,
    student: trip.student || "Unknown Student",
    kind: trip.kind,
    driver: trip.driver || "Unknown Driver",
    scheduled_time:
      trip.kind === "Pickup"
        ? trip.pickup_scheduled_time
        : trip.dropoff_scheduled_time,
    embark_time: formatTimestamp((trip as any).embark_time_nairobi),
    disembark_time: formatTimestamp((trip as any).disembark_time_nairobi),
    pickup_location: trip.pickup_location,
    dropoff_location: trip.dropoff_location,
    status: trip.status,
  }));

  // let mapping = new Mapping();
  // let route = await mapping.getRoute({
  //   origin: {
  //     latitude: ride.schedule?.pickup.latitude!,
  //     longitude: ride.schedule?.pickup.longitude!,
  //   },
  //   destination: {
  //     latitude: ride.schedule?.dropoff.latitude!,
  //     longitude: ride.schedule?.dropoff.longitude!,
  //   },
  // });

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "/rides",
            label: "Rides",
          },
          {
            href: `/rides/${ride_id}`,
            label: "Ride Details",
          },
        ]}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ride Details</h1>
        </div>
      </div>
      <RideDetailsPage
        details={ride}
        student={student}
        vehicle={vehicle}
        driver={driver}
        guardian={guardian}
        tripHistory={formattedTripHistory}
        // route={route}
      />
    </div>
  );
}
function use(params: Promise<{ id: any }>): { ride_id: any } {
  throw new Error("Function not implemented.");
}
