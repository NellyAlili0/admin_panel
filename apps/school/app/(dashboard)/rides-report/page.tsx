import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { database, sql } from "@/database/config";
import { cookies } from "next/headers";
import RideHistoryFilters from "./RideHistoryFilters";
interface RideRecord {
  id: number;
  kind: string;
  vehicle_registration_number: string | null;
  student: string | null;
  driver: string | null;
  pickup_scheduled_time: string | null;
  dropoff_scheduled_time: string | null;
  embark_time_nairobi: string | null;
  disembark_time_nairobi: string | null;
  embark_time: Date | null;
  disembark_time: Date | null;
  pickup_location: string | null;
  dropoff_location: string | null;
  status: string;
  date: Date | string;
}

const getCurrentDateInNairobi = () => {
  const today = new Date();
  const nairobiDate = today.toLocaleDateString("en-CA", {
    timeZone: "Africa/Nairobi",
  });
  return new Date(nairobiDate);
};

const formatTimestamp = (timestamp: any) => {
  if (!timestamp) return "N/A";

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
    console.error("Error formatting timestamp:", error);
    return "Error formatting date";
  }
};

const hasScheduledTimePassed = (scheduledTime: string) => {
  if (!scheduledTime) return false;
  const scheduled = new Date(
    new Date(scheduledTime).toLocaleString("en-US", {
      timeZone: "Africa/Nairobi",
    })
  );
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Africa/Nairobi" })
  );
  return scheduled < now;
};

const isScheduledInFuture = (scheduledTime: string) => {
  if (!scheduledTime) return false;
  const scheduled = new Date(
    new Date(scheduledTime).toLocaleString("en-US", {
      timeZone: "Africa/Nairobi",
    })
  );
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Africa/Nairobi" })
  );
  return scheduled > now;
};

export default async function Page() {
  const cookieStore = await cookies();
  const id = cookieStore.get("school_id")?.value;
  const school_id = Number(id);

  const nairobiNow = new Date().toLocaleString("en-US", {
    timeZone: "Africa/Nairobi",
  });

  const todayInNairobi = getCurrentDateInNairobi();

  const tripHistory = (await database
    .selectFrom("daily_ride")
    .leftJoin("ride", "ride.id", "daily_ride.rideId")
    .leftJoin("student", "student.id", "ride.studentId")
    .leftJoin("user as driver", "driver.id", "daily_ride.driverId")
    .leftJoin("vehicle", "vehicle.id", "daily_ride.vehicleId")
    .select([
      "daily_ride.id",
      "daily_ride.kind",
      "vehicle.registration_number as vehicle_registration_number",
      "student.name as student",
      "driver.name as driver",
      sql`ride.schedule->'pickup'->>'start_time'`.as("pickup_scheduled_time"),
      sql`ride.schedule->'dropoff'->>'start_time'`.as("dropoff_scheduled_time"),
      sql`daily_ride.embark_time AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Nairobi'`.as(
        "embark_time_nairobi"
      ),
      sql`daily_ride.disembark_time AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Nairobi'`.as(
        "disembark_time_nairobi"
      ),
      "daily_ride.embark_time",
      "daily_ride.disembark_time",
      sql`ride.schedule->'pickup'->>'location'`.as("pickup_location"),
      sql`ride.schedule->'dropoff'->>'location'`.as("dropoff_location"),
      "daily_ride.status",
      "daily_ride.date",
    ])
    .where("student.schoolId", "=", school_id)
    .where(({ or, eb }) =>
      or([
        eb("daily_ride.date", "<", todayInNairobi),
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
    .execute()) as RideRecord[];

  // if (tripHistory.length > 0) {
  //   console.log("Sample trip record:", tripHistory[0]);
  // }

  interface RideData {
    id: number;
    student: string;
    driver: string;
    vehicle_registration_number: string;
    scheduled_time: string;
    embark_time: string;
    disembark_time: string;
    kind: string;
    status: string;
    pickup_location?: string | null;
    dropoff_location?: string | null;
  }

  const allRides: RideData[] = tripHistory.map((ride) => {
    const scheduledTime =
      ride.kind === "Pickup"
        ? ride.pickup_scheduled_time
        : ride.dropoff_scheduled_time;

    const scheduledPassed = hasScheduledTimePassed(String(scheduledTime || ""));
    const scheduledFuture = isScheduledInFuture(String(scheduledTime || ""));

    let embark_time: string;
    let disembark_time: string;

    if (scheduledPassed && ride.status === "Inactive") {
      embark_time = "Ride Cancelled";
      disembark_time = "Ride Cancelled";
    } else if (scheduledFuture) {
      embark_time = "N/A";
      disembark_time = "N/A";
    } else {
      embark_time = formatTimestamp(ride.embark_time_nairobi);
      disembark_time = formatTimestamp(ride.disembark_time_nairobi);
    }

    return {
      id: ride.id,
      student: ride.student ?? "",
      driver: ride.driver ?? "",
      vehicle_registration_number:
        ride.vehicle_registration_number ?? "Unknown Vehicle",
      scheduled_time: String(scheduledTime ?? ""),
      embark_time,
      disembark_time,
      kind: ride.kind,
      status: ride.status,
    };
  });

  // Group rides by vehicle
  const vehicleGroups: Record<string, RideData[]> = allRides.reduce(
    (acc, ride) => {
      const vehicle = ride.vehicle_registration_number ?? "Unknown Vehicle";
      if (!acc[vehicle]) acc[vehicle] = [];
      acc[vehicle].push(ride);
      return acc;
    },
    {} as Record<string, RideData[]>
  );

  const vehicles = Object.keys(vehicleGroups).sort();

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "/school/ride-history",
            label: "Ride History",
          },
        ]}
      />
      <div className="flex items-center justify-between">
        <div className="my-5">
          <h1 className="text-2xl font-bold tracking-tight">Rides History</h1>
        </div>
      </div>
      <Card>
        <CardContent>
          {vehicles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No ride history available
            </div>
          ) : (
            <Tabs defaultValue={vehicles[0]} className="w-full">
              <TabsList
                className="grid w-full mb-4"
                style={{
                  gridTemplateColumns: `repeat(${vehicles.length}, minmax(0, 1fr))`,
                }}
              >
                {vehicles.map((vehicle) => (
                  <TabsTrigger
                    key={vehicle}
                    value={vehicle}
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>{vehicle}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {vehicles.map((vehicle) => (
                <TabsContent
                  key={vehicle}
                  value={vehicle}
                  className="space-y-4"
                >
                  <RideHistoryFilters data={vehicleGroups[vehicle]} />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
