import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { database, sql } from "@/database/config";
import GenTable from "@/components/tables";
import { MarkAsInspected } from "./forms";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  Clock,
  FileText,
  MapPin,
  MessageSquare,
  Phone,
  Shield,
} from "lucide-react";
import Link from "next/link";

const getCurrentDateInNairobi = () => {
  const today = new Date();
  const nairobiDate = today.toLocaleDateString("en-CA", {
    // YYYY-MM-DD format
    timeZone: "Africa/Nairobi",
  });
  return new Date(nairobiDate);
};

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

export default async function Page(props: {
  params: Promise<{ plate: string }>;
}) {
  const { plate } = await props.params; // ✅ await params

  // Fetch vehicle information
  const vehicleInfo = await database
    .selectFrom("vehicle")
    .selectAll()
    .where("registration_number", "=", plate)
    .executeTakeFirst();

  if (!vehicleInfo) {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center">
        Vehicle not found
      </div>
    );
  }

  // Fetch driver information
  const driverInfo = await database
    .selectFrom("user")
    .selectAll()
    .where("id", "=", vehicleInfo.userId ?? 0)
    .executeTakeFirst();

  if (!driverInfo) {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center">
        Driver not found
      </div>
    );
  }

  // Fetch assigned rides
  const assignedRides = await database
    .selectFrom("ride")
    .leftJoin("student", "student.id", "ride.studentId")
    .select(["ride.id", "student.name", "ride.status", "ride.schedule"])
    .where("driverId", "=", driverInfo.id)
    .execute();

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
    .where("daily_ride.vehicleId", "=", vehicleInfo.id)
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

  const formattedTripHistory = tripHistory.map((trip) => ({
    id: trip.id,
    status: trip.status,
    student: trip.student || "Unknown Student",
    driver: trip.driver || "Unknown Driver",
    kind: trip.kind,
    embark_time: formatTimestamp((trip as any).embark_time_nairobi),
    disembark_time: formatTimestamp((trip as any).disembark_time_nairobi),
    scheduled_time:
      trip.kind === "Pickup"
        ? trip.pickup_scheduled_time
        : trip.dropoff_scheduled_time,
    pickup_location: trip.pickup_location,
    dropoff_location: trip.dropoff_location,
    date: trip.date,
  }));

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "/vehicles",
            label: "Vehicles",
          },
          {
            href: `/vehicles/${plate}`,
            label: plate,
          },
        ]}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{plate}</h1>
        {vehicleInfo.is_inspected ? (
          <Badge>Inspected</Badge>
        ) : (
          <MarkAsInspected plate={plate} />
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <img
            src={
              vehicleInfo.vehicle_image_url ??
              "https://placehold.co/600x400?text=Not+Found"
            }
            alt="Vehicle Image"
            className="bg-cover h-fit w-full"
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">
                {vehicleInfo.vehicle_name ?? "Unnamed Vehicle"}
              </h2>
              <p className="text-muted-foreground">
                {vehicleInfo.vehicle_model ?? "Unknown"} -{" "}
                {vehicleInfo.vehicle_year ?? "N/A"}
              </p>
            </div>
            <Badge className="bg-green-500 hover:bg-green-600">
              {vehicleInfo.vehicle_type ?? "Unknown"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Model</p>
              <p className="font-medium">
                {vehicleInfo.vehicle_model ?? "Unknown"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Year</p>
              <p className="font-medium">{vehicleInfo.vehicle_year ?? "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">License Plate</p>
              <p className="font-medium">{plate}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Seat Capacity</p>
              <p className="font-medium">
                {vehicleInfo.available_seats ?? 0} seats (
                {vehicleInfo.available_seats ?? 0} available)
              </p>
            </div>
          </div>
        </div>
      </div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Driver/Owner Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="text-xl font-medium">
                  {driverInfo.name ?? "Unknown Driver"}
                </h3>
                <p className="text-muted-foreground">
                  Vehicle Owner & Primary Driver
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{driverInfo.phone_number ?? "Not provided"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {driverInfo.meta?.neighborhood ?? "Unknown"},{" "}
                  {driverInfo.meta?.county ?? "Unknown"}
                </span>
              </div>
            </div>
            <Link href={`/drivers/${driverInfo.email ?? driverInfo.id}`}>
              <Button>View All Details</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      {/* Rides Information Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Ride Information</CardTitle>
          <CardDescription>
            View assigned rides and ride history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="assigned" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="assigned" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Assigned Rides</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Ride History</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assigned" className="space-y-4">
              <div className="rounded-md border">
                <GenTable
                  title="Assigned Rides"
                  cols={["id", "name", "schedule_info", "status"]}
                  data={assignedRides.map((ride) => {
                    let scheduleInfo = "Not scheduled";
                    if (ride.schedule && typeof ride.schedule === "object") {
                      const schedule = ride.schedule as any;
                      scheduleInfo = `${schedule.pickup.location || "Unknown"} → ${schedule.dropoff.location || "Unknown"} | $${schedule.cost || "0"}`;
                    }

                    return {
                      ...ride,
                      name: ride.name ?? "Unknown Passenger",
                      schedule_info: scheduleInfo,
                      status: ride.status ?? "Unknown",
                    };
                  })}
                  baseLink="/rides/"
                  uniqueKey="id"
                />
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="rounded-md border">
                <GenTable
                  title="Trip History"
                  cols={[
                    "student",
                    "driver",
                    "kind",
                    "scheduled_time",
                    "embark_time",
                    "disembark_time",
                    "pickup_location",
                    "dropoff_location",
                    "status",
                  ]}
                  data={formattedTripHistory}
                  baseLink="/rides/trip/"
                  uniqueKey="id"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {/* Vehicle Documents and Comments Tabs */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Vehicle Documentation</CardTitle>
          <CardDescription>
            View vehicle logbook, insurance certificate, and comments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="logbook" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="logbook" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Logbook</span>
              </TabsTrigger>
              <TabsTrigger
                value="insurance"
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                <span>Insurance</span>
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Comments</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="logbook" className="space-y-4">
              <div className="relative aspect-[4/3] w-full max-w-md mx-auto rounded-lg overflow-hidden border">
                <img
                  src={
                    vehicleInfo.vehicle_registration ??
                    "https://placehold.co/600x400?text=Not+Found"
                  }
                  alt="Vehicle Logbook"
                  className="bg-cover h-fit w-full"
                />
              </div>
            </TabsContent>

            <TabsContent value="insurance" className="space-y-4">
              <div className="relative aspect-[4/3] w-full max-w-md mx-auto rounded-lg overflow-hidden border">
                <img
                  src={
                    vehicleInfo.insurance_certificate ??
                    "https://placehold.co/600x400?text=Not+Found"
                  }
                  alt="Insurance Certificate"
                  className="bg-cover h-fit w-full"
                />
              </div>
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">
                  No comments available for this vehicle.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
