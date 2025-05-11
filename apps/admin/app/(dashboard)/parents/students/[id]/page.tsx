import { Breadcrumbs } from "@/components/breadcrumbs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@repo/database";
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

export default async function Page({ params }: { params: any }) {
  const { id } = await params;
  // student info
  let student = await db
    .selectFrom("student")
    .leftJoin("school", "school.id", "student.school_id")
    .select([
      "student.id",
      "student.name",
      "student.gender",
      "student.address",
      "student.comments",
      "student.created_at",
      "student.profile_picture",
      "student.parent_id",
      "school.name as school",
      "student.school_id",
    ])
    .where("student.id", "=", Number(id))
    .executeTakeFirst();
  if (!student) {
    return <div>Student not found</div>;
  }
  // parent info
  let parent = await db
    .selectFrom("user")
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
      "user.status",
    ])
    .where("user.id", "=", student.parent_id)
    .executeTakeFirst();
  if (!parent) {
    return <div>Parent not found</div>;
  }
  // ride history
  let tripHistory = await db
    .selectFrom("daily_ride")
    .leftJoin("ride", "ride.id", "daily_ride.ride_id")
    .leftJoin("student", "student.id", "ride.student_id")
    .leftJoin("user", "user.id", "ride.driver_id")
    .select([
      "daily_ride.id",
      "daily_ride.status",
      "user.name as driver",
      "daily_ride.start_time",
      "daily_ride.end_time",
      "daily_ride.kind",
    ])
    .where("ride.parent_id", "=", parent.id)
    .where("student.id", "=", Number(student.id))
    .where("daily_ride.status", "!=", "Inactive")
    .orderBy("daily_ride.date", "desc")
    .execute();
  // check if there is any active ride
  let activeRide = await db
    .selectFrom("daily_ride")
    .leftJoin("ride", "ride.id", "daily_ride.ride_id")
    .leftJoin("student", "student.id", "ride.student_id")
    .leftJoin("user", "user.id", "ride.driver_id")
    .select(["daily_ride.id"])
    .where("ride.parent_id", "=", parent.id)
    .where("student.id", "=", Number(student.id))
    .where("daily_ride.status", "=", "Active")
    .executeTakeFirst();
  // check if there is any active assigned ride
  let assignedRide = await db
    .selectFrom("ride")
    .leftJoin("user", "user.id", "ride.driver_id")
    .leftJoin("vehicle", "vehicle.id", "ride.vehicle_id")
    .select([
      "ride.id",
      "schedule",
      "user.name as driver",
      "admin_comments",
      "ride.meta",
      "ride.created_at",
      "ride.updated_at",
      "ride.status",
      "vehicle.vehicle_name",
      "vehicle.registration_number",
    ])
    .where("ride.parent_id", "=", parent.id)
    .where("ride.student_id", "=", Number(student.id))
    .where("ride.status", "=", "Ongoing")
    .executeTakeFirst();
    // get a list of all schools
    let schools = await db
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
            href: `/parents/${parent.email?.replace("@", "%40")}`,
            label: parent.name,
          },
          {
            href: `/students/${id}`,
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
                  {/* Pulse animation */}
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
                    <p className="font-medium">{student.address}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <School className="h-4 w-4" />
                      <span>School</span>
                    </div>
                    {student.school_id ? (
                      <p className="font-medium">{student.school}</p>
                    ) : (
                      <LinkSchoolDialog student_id={student.id.toString()} schools={schools} />
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
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{parent.name}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Phone className="h-4 w-4" />
                    </div>
                    <span>{parent.phone_number}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Mail className="h-4 w-4" />
                    </div>
                    <span>{parent.email}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href={`/parents/${parent.email?.replace("@", "%40")}`}>
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
            {assignedRide != null ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Daily Schedule</h3>
                      <Badge>Active</Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Home className="h-5 w-5 text-primary" />
                          <h4 className="font-medium"> Pickup</h4>
                        </div>
                        <div className="pl-7 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Time:</span>
                            <span className="font-medium"> {assignedRide.schedule?.pickup.start_time}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Location:
                            </span>
                            <span className="font-medium">{assignedRide.schedule?.pickup.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Driver:
                            </span>
                            <span className="font-medium">{assignedRide.driver}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Vehicle:
                            </span>
                            <span className="font-medium">
                              {assignedRide.vehicle_name} ({assignedRide.registration_number})
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
                            <span className="font-medium">{assignedRide.schedule?.dropoff.start_time}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Location:
                            </span>
                            <span className="font-medium">{assignedRide.schedule?.dropoff.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Driver:
                            </span>
                            <span className="font-medium">{assignedRide.driver}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Vehicle:
                            </span>
                            <span className="font-medium">
                              {assignedRide.vehicle_name} ({assignedRide.registration_number})
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
                      {/* This would be replaced with an actual map component in a real application */}
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
                        <span>{assignedRide.schedule?.pickup.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span>{assignedRide.schedule?.dropoff.location}</span>
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
              data={tripHistory}
              baseLink={"/rides/trip/"}
              uniqueKey="id"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
