import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { database } from "@/database/config";
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
import { use } from "react";

// Define interfaces for query results
interface VehicleInfo {
  id: number;
  userId: number | null;
  vehicle_name: string | null;
  registration_number: string | null;
  vehicle_type: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  available_seats: number | null;
  status: string | null;
  vehicle_image_url: string | null;
  vehicle_registration: string | null;
  insurance_certificate: string | null;
  is_inspected: boolean | null;
}

interface DriverInfo {
  id: number;
  name: string | null;
  phone_number: string | null;
  email: string | null;
  meta: { neighborhood?: string; county?: string } | null;
}

interface AssignedRide {
  id: number;
  name: string | null;
  status: string | null;
  schedule: string | null;
}

interface TripHistory {
  id: number;
  status: string | null;
  passenger: string | null;
  start_time: string | null;
  end_time: string | null;
  kind: string | null;
}

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

  // Fetch trip history
  const tripHistory = await database
    .selectFrom("daily_ride")
    .leftJoin("ride", "ride.id", "daily_ride.rideId")
    .leftJoin("student", "student.id", "ride.studentId")
    .select([
      "daily_ride.id",
      "daily_ride.status",
      "student.name as passenger",
      "daily_ride.start_time",
      "daily_ride.end_time",
      "daily_ride.kind",
    ])
    .where("daily_ride.vehicleId", "=", vehicleInfo.id)
    .where("daily_ride.status", "!=", "Inactive")
    .orderBy("daily_ride.date", "desc")
    .execute();

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
                  cols={["id", "name", "schedule", "status"]}
                  data={assignedRides.map((ride) => ({
                    ...ride,
                    name: ride.name ?? "Unknown Passenger",
                    schedule: ride.schedule ?? "Not scheduled",
                    status: ride.status ?? "Unknown",
                  }))}
                  baseLink="/rides/"
                  uniqueKey="id"
                />
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="rounded-md border">
                <GenTable
                  title="Trip History"
                  cols={["id", "passenger", "start_time", "end_time", "status"]}
                  data={tripHistory.map((trip) => ({
                    ...trip,
                    passenger: trip.passenger ?? "Unknown Passenger",
                    start_time: trip.start_time ?? "N/A",
                    end_time: trip.end_time ?? "N/A",
                    status: trip.status ?? "Unknown",
                    kind: trip.kind ?? "Unknown",
                  }))}
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
