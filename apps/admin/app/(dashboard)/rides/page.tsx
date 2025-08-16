import { Breadcrumbs } from "@/components/breadcrumbs";
import { database } from "@/database/config";
import GenTable from "@/components/tables";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Page() {
  // All rides
  let all_rides = await database
    .selectFrom("ride")
    .leftJoin("user", "user.id", "ride.parentId")
    .leftJoin("student", "student.id", "ride.studentId")
    .select([
      "ride.id",
      "ride.status",
      "ride.created_at",
      "user.name as parent",
      "student.name as student",
      "ride.admin_comments",
    ])
    .execute();

  // Ongoing rides
  let ongoing_rides = await database
    .selectFrom("ride")
    .leftJoin("user", "user.id", "ride.parentId")
    .leftJoin("student", "student.id", "ride.studentId")
    .select([
      "ride.id",
      "ride.status",
      "ride.created_at",
      "user.name as parent",
      "student.name as student",
      "ride.admin_comments",
    ])
    .where("ride.status", "=", "Ongoing")
    .execute();

  // Requested rides
  let requested_rides = await database
    .selectFrom("ride")
    .leftJoin("user", "user.id", "ride.parentId")
    .leftJoin("student", "student.id", "ride.studentId")
    .select([
      "ride.id",
      "ride.status",
      "ride.created_at",
      "user.name as parent",
      "student.name as student",
    ])
    .where("ride.status", "=", "Requested")
    .execute();

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "/rides",
            label: "Rides",
          },
        ]}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rides</h1>
        </div>
        <Link href="/rides/create">
          <Button variant="default">Create Ride</Button>
        </Link>
      </div>
      <GenTable
        title="All Rides"
        cols={["id", "status", "parent", "student"]}
        data={all_rides}
        baseLink="/rides/"
        uniqueKey="id"
      />
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Requested Rides</CardTitle>
            <CardDescription>Trips requested by parents</CardDescription>
          </CardHeader>
          <CardContent>
            <GenTable
              title="Requested Rides"
              cols={["id", "status", "parent", "student"]}
              data={requested_rides}
              baseLink="/rides/"
              uniqueKey="id"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ongoing Rides</CardTitle>
            <CardDescription>Trips currently in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <GenTable
              title="Ongoing Rides"
              cols={["id", "status", "parent", "student"]}
              data={ongoing_rides}
              baseLink="/rides/"
              uniqueKey="id"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
