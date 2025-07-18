import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Car, Fuel, TrendingUp, Users } from "lucide-react";
import { db, sql } from "@repo/database";
import { VehicleCard } from "@/components/vehicle-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "@/components/tables";

export default async function Page() {
  let metrics: any = await sql`SELECT 
    (SELECT COUNT(*) FROM public."vehicle") as total_vehicles,
    (SELECT COUNT(*) FROM public."user" WHERE "kind" = 'Driver') as total_drivers,
    (SELECT COUNT(*) FROM public."user" WHERE "kind" = 'Parent') as total_parents,
    (SELECT COUNT(*) FROM public."ride" WHERE "status" != 'Cancelled') as total_rides
    `.execute(db);
  let totalVehicles = metrics.rows[0].total_vehicles;
  let totalDrivers = metrics.rows[0].total_drivers;
  let totalParents = metrics.rows[0].total_parents;
  let totalRides = metrics.rows[0].total_rides;

  let requested = await db
    .selectFrom("ride")
    .leftJoin("user", "ride.parent_id", "user.id")
    .select(["ride.id", "user.name", "user.phone_number"])
    .where("ride.status", "=", "Requested")
    .execute();

  let kycRequests = await db
    .selectFrom("kyc")
    .leftJoin("user", "kyc.user_id", "user.id")
    .select(["kyc.id", "user.name", "user.email", "kyc.is_verified"])
    .where("kyc.is_verified", "=", false)
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your Zidallie fleet management dashboard.
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
            <div className="text-2xl font-bold">{totalVehicles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDrivers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Parents</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRides}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Requested Rides </CardTitle>
            <CardDescription>Trips requested by parents</CardDescription>
          </CardHeader>
          <CardContent>
            <GenTable
              title="Requested Rides"
              cols={["id", "name", "phone_number"]}
              data={requested}
              baseLink="/rides/"
              uniqueKey="id"
            />
          </CardContent>
        </Card>
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle> Driver KYC Requests </CardTitle>
            <CardDescription> KYC requests from drivers </CardDescription>
          </CardHeader>
          <CardContent>
            <GenTable
              title="Requests"
              cols={["id", "name", "email", "verified"]}
              data={kycRequests}
              baseLink="/drivers/"
              uniqueKey="email"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
