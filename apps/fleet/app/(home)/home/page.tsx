import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { VehicleCard } from "@/components/vehicle-card";
import { Car, Fuel, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { authDetails } from "@/lib/auth";
import { db } from "@repo/database";
import { RecentTrips } from "@/components/recent-trips";
import { MaintenanceAlert } from "@/components/maintenance-alert";

export default async function Page() {
    const auth = await authDetails()
    let user_id = 1 //auth?.user_id
    const vehicles = await db.selectFrom('vehicle')
        .leftJoin('daily_ride', 'vehicle.id', 'daily_ride.vehicle_id')
        .select(['vehicle.id', 'vehicle_name', 'registration_number', 'vehicle_type', 'seat_count', 'available_seats', 'daily_ride.status'])
        .where('fleet_manager_id', '=', user_id)
        .orderBy('vehicle_name', 'asc')
        .execute();
    let totalFuel = await db.selectFrom('fuel')
        .select(({ fn }) => [
            fn.sum<number>('quantity').as('totalFuel'),
        ])
        .where('fleet_manager_id', '=', user_id)
        .executeTakeFirst();

    let recentTrips = await db.selectFrom('daily_ride')
        .leftJoin('vehicle', 'daily_ride.vehicle_id', 'vehicle.id')
        .leftJoin('user', 'daily_ride.driver_id', 'user.id')
        .select(['daily_ride.id', 'start_time', 'end_time', 'daily_ride.meta', 'vehicle_name', 'user.first_name', 'user.last_name'])
        .where('fleet_manager_id', '=', user_id)
        .where('daily_ride.status', '=', 'Finished')
        .orderBy('start_time', 'desc')
        .limit(5)
        .execute();

    let upcoming_maintenance = await db.selectFrom('maintenance')
        .leftJoin('vehicle', 'maintenance.vehicle_id', 'vehicle.id')
        .select(['vehicle.id', 'vehicle_name', 'registration_number', 'maintenance.status'])
        .where('vehicle.fleet_manager_id', '=', user_id)
        .orderBy('maintenance.next_maintenance', 'asc')
        .limit(5)
        .execute();
    return (
        <main className="flex-1 p-6 md:p-8 pt-6">
            <div className="flex flex-col gap-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">Welcome to your Zidallie fleet management dashboard.</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
                            <Car className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{vehicles.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Available Seats</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{vehicles.reduce((acc, vehicle) => acc + vehicle.available_seats, 0)}</div>
                            <p className="text-xs text-muted-foreground">All Vehicles</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1,248 km</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Fuel Consumption</CardTitle>
                            <Fuel className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalFuel?.totalFuel || 0}L</div>
                            <p className="text-xs text-muted-foreground">{totalFuel?.totalFuel || 0} Liters/Month</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-7">
                    <Card className="md:col-span-4">
                        <CardHeader>
                            <CardTitle>Recent Trips</CardTitle>
                            <CardDescription>Your fleet's latest 5 trips</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentTrips.length > 0 ? <RecentTrips trips={recentTrips} /> : <div className="flex flex-col items-center justify-center h-full gap-2 min-h-[100px]">
                                <div className="text-2xl font-bold mb-2">No Trips</div>
                                <div className="text-muted-foreground">You don't have any trips yet.</div>
                            </div>}
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-3">
                        <CardHeader>
                            <CardTitle>Maintenance Alerts</CardTitle>
                            <CardDescription>Vehicles requiring attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {upcoming_maintenance.length > 0 ? <MaintenanceAlert alerts={upcoming_maintenance} /> : <div className="flex flex-col items-center justify-center h-full gap-2 min-h-[100px]">
                                <div className="text-2xl font-bold mb-2">No Alerts</div>
                                <div className="text-muted-foreground">You don't have any maintenance alerts yet.</div>
                            </div>}
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-4">Your Vehicles</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {vehicles.map((vehicle) => (
                            <VehicleCard
                                key={vehicle.id}
                                id={vehicle.id.toString()}
                                name={vehicle.vehicle_name!}
                                licensePlate={vehicle.registration_number}
                                status={vehicle.status!}
                                available_seats={vehicle.available_seats}
                                total_seats={vehicle.seat_count}
                            />
                        ))}
                    </div>
                    {vehicles.length == 0 && <div className="">
                        <div className="flex flex-col items-center justify-center h-full gap-2 min-h-[300px]">
                            <div className="text-2xl font-bold mb-2">No Vehicles</div>
                            <div className="text-muted-foreground">You don't have any vehicles yet.</div>
                            <p className="text-muted-foreground"> Reach out to Administration to add a vehicle</p>
                        </div>
                    </div>}
                </div>
            </div>
        </main>
    );
}