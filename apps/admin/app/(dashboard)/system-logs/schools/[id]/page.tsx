import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "@/components/tables";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { database, sql } from "@/database/config";

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
    // If it's already converted by PostgreSQL, just format it
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

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params; // ✅ await params
  const school_id = Number(id);

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
    .where("student.schoolId", "=", school_id)
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

  // Debug: Log a sample record to see what we're getting from the database
  if (tripHistory.length > 0) {
    console.log("Sample trip record:", tripHistory[0]);
  }

  // Filter and transform data for pickup rides
  const pickupRides = tripHistory
    .filter((ride) => ride.kind === "Pickup")
    .map((ride) => ({
      ...ride,
      scheduled_time: ride.pickup_scheduled_time,
      // Use type assertion to access the custom fields
      embark_time: formatTimestamp((ride as any).embark_time_nairobi),
      disembark_time: formatTimestamp((ride as any).disembark_time_nairobi),
    }));

  // Filter and transform data for dropoff rides
  const dropoffRides = tripHistory
    .filter((ride) => ride.kind === "Dropoff")
    .map((ride) => ({
      ...ride,
      scheduled_time: ride.dropoff_scheduled_time,
      // Use type assertion to access the custom fields
      embark_time: formatTimestamp((ride as any).embark_time_nairobi),
      disembark_time: formatTimestamp((ride as any).disembark_time_nairobi),
    }));

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
          <Tabs defaultValue="pickup" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger
                value="pickup"
                className="flex items-center gap-2 mr-6"
              >
                <Calendar className="h-4 w-4" />
                <span>Pickup</span>
              </TabsTrigger>
              <TabsTrigger value="dropoff" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Dropoff</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pickup" className="space-y-4">
              <div className="rounded-md border">
                <GenTable
                  title="Ride History"
                  cols={[
                    "student",
                    "driver",
                    "scheduled_time",
                    "embark_time",
                    "disembark_time",
                    "pickup_location",
                    "dropoff_location",
                    "status",
                  ]}
                  data={pickupRides}
                  baseLink=""
                  uniqueKey=""
                />
              </div>
            </TabsContent>

            <TabsContent value="dropoff" className="space-y-4">
              <div className="rounded-md border">
                <GenTable
                  title="Ride History"
                  cols={[
                    "student",
                    "driver",
                    "scheduled_time",
                    "embark_time",
                    "disembark_time",
                    // "pickup_location",
                    // "dropoff_location",
                    "status",
                  ]}
                  data={dropoffRides}
                  baseLink=""
                  uniqueKey=""
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
