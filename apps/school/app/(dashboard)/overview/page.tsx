import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "@/components/tables";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Fuel, TrendingUp, Users } from "lucide-react";
import React from "react";
import { cookies } from "next/headers";
import { database } from "../../../database/config";

async function Overview() {
  const cookieStore = await cookies();
  const school_id = cookieStore.get("school_id")?.value;
  const schoolId = Number(school_id);

  // All statistics derived from students of this school through their rides
  const [vehicleCount, driverCount, parentCount, rideCount] = await Promise.all(
    [
      // Vehicles: Get unique vehicles from rides of students in this school
      database
        .selectFrom("student")
        .innerJoin("ride", "ride.studentId", "student.id")
        .innerJoin("vehicle", "ride.vehicleId", "vehicle.id")
        .select((eb) => [eb.fn.count("vehicle.id").distinct().as("count")])
        .where("student.schoolId", "=", schoolId)
        .where("ride.status", "!=", "Cancelled")
        .where("ride.vehicleId", "is not", null)
        .executeTakeFirst(),

      // Drivers: Get unique drivers from rides of students in this school
      database
        .selectFrom("student")
        .innerJoin("ride", "ride.studentId", "student.id")
        .innerJoin("user as driver", "ride.driverId", "driver.id")
        .select((eb) => [eb.fn.count("driver.id").distinct().as("count")])
        .where("student.schoolId", "=", schoolId)
        .where("ride.status", "!=", "Cancelled")
        .where("ride.driverId", "is not", null)
        .where("driver.kind", "=", "Driver")
        .executeTakeFirst(),

      // Parents: Get unique parents from students in this school
      database
        .selectFrom("student")
        .innerJoin("user as parent", "student.parentId", "parent.id")
        .select((eb) => [eb.fn.count("parent.id").distinct().as("count")])
        .where("student.schoolId", "=", schoolId)
        .where("parent.kind", "=", "Parent")
        .executeTakeFirst(),

      // Total rides: All rides for students in this school
      database
        .selectFrom("student")
        .innerJoin("ride", "ride.studentId", "student.id")
        .select((eb) => [eb.fn.countAll<number>().as("count")])
        .where("student.schoolId", "=", schoolId)
        .where("ride.status", "!=", "Cancelled")
        .executeTakeFirst(),
    ]
  );

  const metrics = {
    total_vehicles: vehicleCount?.count ?? 0,
    total_drivers: driverCount?.count ?? 0,
    total_parents: parentCount?.count ?? 0,
    total_rides: rideCount?.count ?? 0,
  };

  // Latest 5 students in this school
  const latestStudents = await database
    .selectFrom("student")
    .leftJoin("user as parent", "student.parentId", "parent.id")
    .select([
      "student.id",
      "student.name",
      "parent.phone_number",
      "student.created_at",
      "student.parentId",
      "student.schoolId",
    ])
    .where("student.schoolId", "=", schoolId)
    .orderBy("student.created_at", "desc")
    .limit(5)
    .execute();

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "/overview",
            label: "Overview",
          },
        ]}
      />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm my-5 border border-gray-300 p-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground my-3">
            Welcome to your school management dashboard.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_vehicles}</div>
            <p className="text-xs text-muted-foreground">
              Serving students in this school
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_drivers}</div>
            <p className="text-xs text-muted-foreground">
              Active drivers for this school
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Parents</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_parents}</div>
            <p className="text-xs text-muted-foreground">
              Parents with students here
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_rides}</div>
            <p className="text-xs text-muted-foreground">
              For students in this school
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-7 mt-4">
        <Card className="md:col-span-12">
          <CardHeader>
            <CardTitle>Recently Added Students</CardTitle>
          </CardHeader>
          <CardContent>
            <GenTable
              title="Recently Added Students"
              cols={["id", "name", "phone_number"]}
              data={latestStudents}
              baseLink="/records/students/"
              uniqueKey="id"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Overview;
