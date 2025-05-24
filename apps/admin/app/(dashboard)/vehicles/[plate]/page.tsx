import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { db } from "@repo/database";
import GenTable from "@/components/tables";
import { MarkAsInspected } from "./forms";
import { Badge } from "@/components/ui/badge";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default async function Page({ params }: { params: any }) {
  const { plate } = await params;
  // vehicle information
  let vehicleInfo = await db
    .selectFrom("vehicle")
    .selectAll()
    .where("registration_number", "=", plate)
    .executeTakeFirst();
  if (!vehicleInfo) {
    return <div className="h-[500px] flex flex-col items-center justify-center">Vehicle not found</div>;
  }
  //   driver information
  let driverInfo = await db
    .selectFrom("user")
    .selectAll()
    .where("id", "=", vehicleInfo.user_id)
    .executeTakeFirst();
  if (!driverInfo) {
    return <div className="h-[500px] flex flex-col items-center justify-center">Driver not found</div>;
  }
  // assigned rides
  let assignedRides = await db
    .selectFrom("ride")
    .leftJoin("student", "student.id", "ride.student_id")
    .select(["ride.id", "student.name", "ride.status", "ride.schedule"])
    .where("driver_id", "=", driverInfo.id)
    .execute();
  // trip history
  let tripHistory = await db
    .selectFrom("daily_ride")
    .leftJoin("ride", "ride.id", "daily_ride.ride_id")
    .leftJoin("student", "student.id", "ride.student_id")
    .select([
      "daily_ride.id",
      "daily_ride.status",
      "student.name as passenger",
      "daily_ride.start_time",
      "daily_ride.end_time",
      "daily_ride.kind",
    ])
    .where("daily_ride.vehicle_id", "=", vehicleInfo.id)
    .where("daily_ride.status", "!=", "Inactive")
    .orderBy("daily_ride.date", "desc")
    .execute();
  // Button for mark as inspected
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
        {/* {vehicleInfo.is_inspected ? (
          <Badge>Inspected</Badge>
        ) : (
          <MarkAsInspected plate={plate} />
        )} */}
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
                {" "}
                {vehicleInfo.vehicle_name}{" "}
              </h2>
              <p className="text-muted-foreground">
                {vehicleInfo.vehicle_model} - {vehicleInfo.vehicle_year}{" "}
              </p>
            </div>
            <Badge className="bg-green-500 hover:bg-green-600">
              {vehicleInfo.vehicle_type}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Model</p>
              <p className="font-medium"> {vehicleInfo.vehicle_model} </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Year</p>
              <p className="font-medium"> {vehicleInfo.vehicle_year} </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">License Plate</p>
              <p className="font-medium"> {plate} </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Seat Capacity</p>
              <p className="font-medium">
                {" "}
                {vehicleInfo.seat_count} seats ({vehicleInfo.available_seats}{" "}
                available)
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
                <h3 className="text-xl font-medium"> {driverInfo.name} </h3>
                <p className="text-muted-foreground">
                  Vehicle Owner & Primary Driver
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span> {driverInfo.phone_number} </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {driverInfo.meta?.neighborhood},{" "}
                  {driverInfo.meta?.county}{" "}
                </span>
              </div>
            </div>
            <Link href={"/drivers/" + driverInfo.email}>
              <Button> View All Details </Button>
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
                  title="Trip History"
                  cols={["id", "Passenger", "Dates", "status"]}
                  data={assignedRides}
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
                  data={tripHistory}
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
            View vehicle logbook, insurance certificate and comments
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
              <div className="space-y-4">
                <div className="p-4 rounded-lg border">
                  <div className="flex items-start gap-3">
                    {/* <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">John Doe</p>
                        <span className="text-xs text-muted-foreground">
                          May 10, 2023
                        </span>
                      </div>
                      <p className="text-sm">
                        Vehicle was serviced last month. All systems are
                        functioning properly.
                      </p>
                    </div> */}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
