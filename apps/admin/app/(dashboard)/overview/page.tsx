import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Car, Fuel, TrendingUp, Users } from "lucide-react";
import { database } from "@/database/config";
import { VehicleCard } from "@/components/vehicle-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "@/components/tables";

// Define interfaces for query results
interface Metrics {
  total_vehicles: number;
  total_drivers: number;
  total_parents: number;
  total_rides: number;
}

interface RequestedRide {
  id: number;
  name: string | null;
  phone_number: string | null;
  status: string | null;
}

interface KYCRequest {
  id: number;
  name: string | null;
  email: string | null;
  is_verified: boolean;
}

export default async function Page() {
  // Fetch metrics using query builder
  const [vehicleCount, driverCount, parentCount, rideCount] = await Promise.all(
    [
      database
        .selectFrom("vehicle")
        .select((eb) => [eb.fn.countAll<number>().as("count")])
        .executeTakeFirst(),

      database
        .selectFrom("user")
        .select((eb) => [eb.fn.countAll<number>().as("count")])
        .where("kind", "=", "Driver")
        .executeTakeFirst(),

      database
        .selectFrom("user")
        .select((eb) => [eb.fn.countAll<number>().as("count")])
        .where("kind", "=", "Parent")
        .executeTakeFirst(),

      database
        .selectFrom("ride")
        .select((eb) => [eb.fn.countAll<number>().as("count")])
        .where("status", "!=", "Cancelled")
        .executeTakeFirst(),
    ]
  );

  const metrics: Metrics = {
    total_vehicles: vehicleCount?.count ?? 0,
    total_drivers: driverCount?.count ?? 0,
    total_parents: parentCount?.count ?? 0,
    total_rides: rideCount?.count ?? 0,
  };

  if (!metrics) {
    return <div>Error fetching dashboard metrics</div>;
  }

  const { total_vehicles, total_drivers, total_parents, total_rides } = metrics;

  // Fetch requested rides
  const requested = await database
    .selectFrom("ride")
    .leftJoin("user", "ride.parentId", "user.id")
    .select(["ride.id", "user.name", "user.phone_number", "ride.status"])
    .where("ride.status", "=", "Requested")
    .execute();

  // Fetch KYC requests
  const kycRequests = await database
    .selectFrom("kyc")
    .leftJoin("user", "kyc.userId", "user.id")
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
          <p className="text-muted-foreground my-2">
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
            <div className="text-2xl font-bold">{total_vehicles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total_drivers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Parents</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total_parents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total_rides}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-12">
          <CardHeader>
            <CardTitle>Driver KYC Requests</CardTitle>
            <CardDescription>KYC requests from drivers</CardDescription>
          </CardHeader>
          <CardContent>
            <GenTable
              title="Requests"
              cols={["name", "email", "is_verified"]}
              data={kycRequests.map((kyc) => ({
                ...kyc,
                name: kyc.name ?? "Unknown",
                email: kyc.email ?? "Not provided",
                is_verified: kyc.is_verified ? "Verified" : "Pending",
              }))}
              baseLink="/drivers/"
              uniqueKey="email"
            />
          </CardContent>
        </Card>
        {/* <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Requested Rides</CardTitle>
            <CardDescription>Trips requested by parents</CardDescription>
          </CardHeader>
          <CardContent>
            <GenTable
              title="Requested Rides"
              cols={["name", "phone_number"]}
              data={requested.map((ride) => ({
                ...ride,
                name: ride.name ?? "Unknown",
                phone_number: ride.phone_number ?? "Not provided",
              }))}
              baseLink="/rides/"
              uniqueKey="id"
            />
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
