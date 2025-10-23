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
import SearchBar from "./search-bar"; // 👈 add this new component

export default async function Page() {
  // All rides
  const all_rides = await database
    .selectFrom("ride")
    .leftJoin("user", "user.id", "ride.parentId")
    .leftJoin("student", "student.id", "ride.studentId")
    .select([
      "ride.id",
      "ride.status",
      "ride.created_at",
      "user.name as parent_name",
      "user.email as parent",
      "student.name as student",
      "ride.admin_comments",
    ])
    .execute();

  // Ongoing rides
  const ongoing_rides = await database
    .selectFrom("ride")
    .leftJoin("user", "user.id", "ride.parentId")
    .leftJoin("student", "student.id", "ride.studentId")
    .select([
      "ride.id",
      "ride.status",
      "ride.created_at",
      "user.name as parent_name",
      "user.email as parent",
      "student.name as student",
      "ride.admin_comments",
    ])
    .where("ride.status", "=", "Ongoing")
    .execute();

  const formattedAllRides = all_rides.map((ride) => ({
    ...ride,
    parent_name: ride.parent_name ?? "Unknown",
    parent: ride.parent ?? "Unknown",
    student: ride.student ?? "Unknown",
  }));

  const formattedOngoing = ongoing_rides.map((ride) => ({
    ...ride,
    parent_name: ride.parent_name ?? "Unknown",
    parent: ride.parent ?? "Unknown",
    student: ride.student ?? "Unknown",
  }));

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs items={[{ href: "/rides", label: "Rides" }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rides</h1>
        </div>
        <Link href="/rides/create">
          <Button variant="default">Create Ride</Button>
        </Link>
      </div>

      {/* 🔍 Search bar + results */}
      <SearchBar data={formattedAllRides} />

      {/* 🚌 Ongoing rides section */}
      <div className="grid grid-cols-1 gap-4 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Ongoing Rides</CardTitle>
            <CardDescription>Trips currently in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <GenTable
              title="Ongoing Rides"
              cols={["id", "status", "parent", "student"]}
              data={formattedOngoing}
              baseLink="/rides/"
              uniqueKey="id"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
