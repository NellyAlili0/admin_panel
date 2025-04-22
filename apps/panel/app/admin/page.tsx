import { db } from "@repo/database";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, Wallet, Star, Car, Fuel, TrendingUp } from "lucide-react";
import { RideStatistics } from "./ride-stats";

export default async function Page() {
    const parents = await db.selectFrom('user')
        .select([b => b.fn.count("id").as("total")])
        .where('kind', '=', 'Parent')
        .executeTakeFirst();
    const schools = await db.selectFrom('school')
        .select([b => b.fn.count("id").as("total")])
        .executeTakeFirst();
    const verifiedDrivers = await db.selectFrom('kyc')
        .select([b => b.fn.count("id").as("total")])
        .where('is_verified', '=', true)
        .executeTakeFirst();
    const rides = await db.selectFrom('ride')
        .select([b => b.fn.count("id").as("total")])
        .executeTakeFirst();
    const admins = await db.selectFrom('admin')
        .selectAll()
        .execute()
    const revenue = await db.selectFrom('payment')
        .select([b => b.fn.sum("amount").as("total")])
        .where('payment_status', '=', 'Paid')
        .executeTakeFirst();

    const vehicles = await db.selectFrom('vehicle')
        .select([b => b.fn.count("id").as("total")])
        .executeTakeFirst();

    const routes = await db.selectFrom('route')
        .select([b => b.fn.count("id").as("total")])
        .executeTakeFirst();

    const students = await db.selectFrom('student')
        .select([b => b.fn.count("id").as("total")])
        .executeTakeFirst();

    // total number of parents, schools, drivers,
    // verified kyc drivers, total number of students
    // total admins
    return (
        <div className="space-y-4 p-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{rides?.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{verifiedDrivers?.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">Registered Parents</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{parents?.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">KES {revenue?.total || 0}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium"> Schools </CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{schools?.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">Vehicles</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{vehicles?.total}</div>
                        <p className="text-xs text-muted-foreground">Total Available</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium"> Routes </CardTitle>
                        <Fuel className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{routes?.total}</div>
                        <p className="text-xs text-muted-foreground">Total Routes</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium"> Students </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{students?.total}</div>
                        <p className="text-xs text-muted-foreground">Total Students</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RideStatistics />
                <div>
                    <h3 className="text-lg font-medium mb-2">Administrators</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]"> Names </TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {admins.map((admin) => (
                                <TableRow key={admin.id}>
                                    <TableCell className="font-medium">{admin.name}</TableCell>
                                    <TableCell>{admin.email}</TableCell>
                                    <TableCell>{admin.role}</TableCell>
                                    <TableCell className="text-right">{admin.status}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}