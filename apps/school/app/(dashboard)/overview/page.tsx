import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "@/components/tables";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Fuel, TrendingUp, Users } from "lucide-react";
import React from "react";

function Overview() {
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
            <div className="text-2xl font-bold">{5}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{6}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Parents</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{45}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{12}</div>
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
              title="Requested Rides"
              cols={["id", "name", "phone_number"]}
              data={[]}
              baseLink="/rides/"
              uniqueKey="id"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Overview;
