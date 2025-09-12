import { Breadcrumbs } from "@/components/breadcrumbs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { database } from "@/database/config";
import {
  ArrowRight,
  Building,
  Home,
  Mail,
  MapIcon,
  MapPin,
  Phone,
  School,
  User,
} from "lucide-react";
import { LinkSchoolDialog } from "../../forms";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import GenTable from "@/components/tables";
import { use } from "react";

// Define interfaces based on database schema
interface Student {
  id: number;
  name: string;
  gender: "Male" | "Female";
  address: string | null;
  comments: string | null;
  created_at: Date;
  profile_picture: string | null;
  parentId: number | null;
  school: string | null;
  schoolId: number | null;
}

interface Parent {
  id: number;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  kind: "Parent" | "Driver" | "Admin" | null;
  meta: any | null;
  is_kyc_verified: boolean;
  created_at: Date;
  updated_at: Date;
  statusName: string | null;
}

interface DailyRide {
  id: number;
  status: "Active" | "Inactive" | "Started" | "Finished";
  driver: string | null;
  start_time: Date | null;
  end_time: Date | null;
  kind: "Pickup" | "Dropoff";
}

interface AssignedRide {
  id: number;
  schedule: {
    cost: number | null;
    paid: number | null;
    pickup: {
      start_time: string;
      location: string;
      latitude: number;
      longitude: number;
    };
    dropoff: {
      start_time: string;
      location: string;
      latitude: number;
      longitude: number;
    };
    comments?: string;
    dates?: string[];
    kind?: "Private" | "Carpool" | "Bus";
  } | null;
  driver: string | null;
  admin_comments: string | null;
  meta: any | null;
  created_at: Date;
  updated_at: Date;
  status: "Requested" | "Cancelled" | "Ongoing" | "Pending" | "Completed";
  vehicle_name: string | null;
  registration_number: string;
}

interface School {
  id: number;
  name: string;
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const studentId = Number(id);

  // Fetch student info with school name
  const student = await database
    .selectFrom("student")
    .leftJoin("school", "school.id", "student.schoolId")
    .select([
      "student.id",
      "student.name",
      "student.gender",
      "student.address",
      "student.comments",
      "student.created_at",
      "student.profile_picture",
      "student.parentId",
      "school.name as school",
      "student.schoolId",
    ])
    .where("student.id", "=", studentId)
    .executeTakeFirst();

  if (!student) {
    return <div>Student not found</div>;
  }

  // Fetch parent info with status name
  const parent = await database
    .selectFrom("user")
    .leftJoin("status", "status.id", "user.statusId")
    .select([
      "user.id",
      "user.name",
      "user.email",
      "user.phone_number",
      "user.kind",
      "user.meta",
      "user.is_kyc_verified",
      "user.created_at",
      "user.updated_at",
      "status.name as statusName",
    ])
    .where("user.id", "=", student.parentId ?? 0)
    .executeTakeFirst();

  if (!parent) {
    return <div>Parent not found</div>;
  }

  // Fetch ride history
  const tripHistory = await database
    .selectFrom("daily_ride")
    .leftJoin("ride", "ride.id", "daily_ride.rideId")
    .leftJoin("student", "student.id", "ride.studentId")
    .leftJoin("user", "user.id", "ride.driverId")
    .select([
      "daily_ride.id",
      "daily_ride.status",
      "user.name as driver",
      "daily_ride.start_time",
      "daily_ride.end_time",
      "daily_ride.kind",
    ])
    .where("ride.parentId", "=", parent.id)
    .where("student.id", "=", studentId)
    .where("daily_ride.status", "!=", "Inactive")
    .orderBy("daily_ride.date", "desc")
    .execute();

  // Check for active ride
  const activeRide = await database
    .selectFrom("daily_ride")
    .leftJoin("ride", "ride.id", "daily_ride.rideId")
    .leftJoin("student", "student.id", "ride.studentId")
    .leftJoin("user", "user.id", "ride.driverId")
    .select(["daily_ride.id"])
    .where("ride.parentId", "=", parent.id)
    .where("student.id", "=", studentId)
    .where("daily_ride.status", "=", "Ongoing")
    .executeTakeFirst();

  // Check for assigned ride
  const assignedRide = await database
    .selectFrom("ride")
    .leftJoin("user", "user.id", "ride.driverId")
    .leftJoin("vehicle", "vehicle.id", "ride.vehicleId")
    .select([
      "ride.id",
      "ride.schedule",
      "user.name as driver",
      "ride.admin_comments",
      "ride.meta",
      "ride.created_at",
      "ride.updated_at",
      "ride.status",
      "vehicle.vehicle_name",
      "vehicle.registration_number",
    ])
    .where("ride.parentId", "=", parent.id)
    .where("ride.studentId", "=", studentId)
    .where("ride.status", "=", "Ongoing")
    .executeTakeFirst();

  // Fetch all schools
  const schools = await database
    .selectFrom("school")
    .select(["id", "name"])
    .execute();

  return (
    <div>
      <Breadcrumbs
        items={[
          {
            href: "/parents",
            label: "Parents",
          },
          {
            href: `/parents/${parent.email?.replace("@", "%40") ?? "#"}`,
            label: parent.name ?? "Unknown",
          },
          {
            href: `/students/${studentId}`,
            label: student.name,
          },
        ]}
      />
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Student Profile</h1>
          <div className="flex items-center gap-2">
            {activeRide && (
              <Link href={`/rides/trip/${activeRide.id}`}>
                <Badge variant="default">
                  <span className="animate-pulse">On Trip</span>
                </Badge>
              </Link>
            )}
          </div>
        </div>

        {/* Main Student Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Student details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center gap-3">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={student.profile_picture ?? undefined}
                      alt={student.name}
                    />
                    <AvatarFallback>
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h2 className="text-xl font-bold">{student.name}</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <User className="h-4 w-4" />
                      <span>Gender</span>
                    </div>
                    <p className="font-medium">{student.gender}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>Address</span>
                    </div>
                    <p className="font-medium">
                      {student.address ?? "Not provided"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <School className="h-4 w-4" />
                      <span>School</span>
                    </div>
                    {student.schoolId ? (
                      <p className="font-medium">
                        {student.school ?? "Unknown"}
                      </p>
                    ) : (
                      <LinkSchoolDialog
                        studentId={student.id.toString()}
                        schools={schools}
                      />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guardian Information</CardTitle>
              <CardDescription>Parent/Guardian contact details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {parent.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{parent.name ?? "Unknown"}</p>
                    <Badge>{parent.statusName ?? "Unknown Status"}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Phone className="h-4 w-4" />
                    </div>
                    <span>{parent.phone_number ?? "Not provided"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Mail className="h-4 w-4" />
                    </div>
                    <span>{parent.email ?? "Not provided"}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/parents/${parent.email?.replace("@", "%40") ?? "#"}`}
                  >
                    View Guardian Details
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Ride Card with Map */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Assigned Ride</CardTitle>
            <CardDescription>
              Current transportation schedule and route
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignedRide ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Daily Schedule</h3>
                      <Badge>{assignedRide.status}</Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Home className="h-5 w-5 text-primary" />
                          <h4 className="font-medium">Pickup</h4>
                        </div>
                        <div className="pl-7 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Time:</span>
                            <span className="font-medium">
                              {assignedRide.schedule?.pickup.start_time ??
                                "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Location:
                            </span>
                            <span className="font-medium">
                              {assignedRide.schedule?.pickup.location ?? "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Driver:
                            </span>
                            <span className="font-medium">
                              {assignedRide.driver ?? "Not assigned"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Vehicle:
                            </span>
                            <span className="font-medium">
                              {assignedRide.vehicle_name &&
                              assignedRide.registration_number
                                ? `${assignedRide.vehicle_name} (${assignedRide.registration_number})`
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Building className="h-5 w-5 text-primary" />
                          <h4 className="font-medium">Dropoff</h4>
                        </div>
                        <div className="pl-7 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Time:</span>
                            <span className="font-medium">
                              {assignedRide.schedule?.dropoff.start_time ??
                                "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Location:
                            </span>
                            <span className="font-medium">
                              {assignedRide.schedule?.dropoff.location ?? "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Driver:
                            </span>
                            <span className="font-medium">
                              {assignedRide.driver ?? "Not assigned"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Vehicle:
                            </span>
                            <span className="font-medium">
                              {assignedRide.vehicle_name &&
                              assignedRide.registration_number
                                ? `${assignedRide.vehicle_name} (${assignedRide.registration_number})`
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Route Map</h3>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          <span>Home</span>
                        </div>
                        <ArrowRight className="h-4 w-4" />
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                          <span>School</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border">
                      <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                        <div className="text-center">
                          <MapIcon className="h-12 w-12 mx-auto text-slate-400" />
                          <p className="mt-2 text-slate-500">
                            Map showing route from home to school
                          </p>
                          <p className="text-sm text-slate-400">
                            Distance: N/A
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-green-500" />
                        <span>
                          {assignedRide.schedule?.pickup.location ?? "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span>
                          {assignedRide.schedule?.dropoff.location ?? "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <p className="text-muted-foreground">No assigned ride found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ride History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Ride History</CardTitle>
            <CardDescription>Past transportation records</CardDescription>
          </CardHeader>
          <CardContent>
            <GenTable
              title="Ride History"
              cols={[
                "id",
                "driver",
                "start_time",
                "end_time",
                "kind",
                "status",
              ]}
              data={tripHistory.map((ride) => ({
                ...ride,
                driver: ride.driver ?? "Not assigned",
                start_time:
                  ride.start_time?.toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }) ?? "Not started",
                end_time:
                  ride.end_time?.toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }) ?? "Not ended",
              }))}
              baseLink="/rides/trip/"
              uniqueKey="id"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
