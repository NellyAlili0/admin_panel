import { db } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, Wallet, Star, Car, Fuel, TrendingUp, CarIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
export default async function Page() {
    // total users, fleet, schools, active rides, completed, routes
    const users = await db.selectFrom('user')
        .select([b => b.fn.count("id").as("total")])
        .executeTakeFirst();

    const drivers = await db.selectFrom('user')
        .select([b => b.fn.count("id").as("total")])
        .where('kind', '=', 'Driver')
        .executeTakeFirst();
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
    const allRides = await db.selectFrom('ride')
        .select([b => b.fn.count("id").as("total")])
        .executeTakeFirst();

    const completedRides = await db.selectFrom('ride')
        .select([b => b.fn.count("id").as("total")])
        .where('status', '=', 'Finished')
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
    // list of KYC
    const kyc = await db.selectFrom('kyc')
        .leftJoin('user', 'kyc.user_id', 'user.id')
        .select(['kyc.id', 'kyc.created_at', 'user.first_name', 'user.last_name', 'user.phone_number', 'user.email'])
        .where('kyc.is_verified', '=', false)
        .where('kyc.status', '=', 'Active')
        .orderBy('kyc.created_at', 'desc')
        .limit(10)
        .execute();
    return (
        <div className="space-y-4 p-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users?.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{verifiedDrivers?.total}</div>
                        <p className="text-xs text-muted-foreground"> {drivers?.total} Total Drivers</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium"> Parents</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{parents?.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">Completed Rides</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedRides?.total}</div>
                        <p className="text-xs text-muted-foreground"> {allRides?.total} Total Rides</p>
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
                        <p className="text-xs text-muted-foreground">Total Fleet</p>
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
            <div className="grid gap-4 md:grid-cols-2">
                <div className="">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold"> Driver KYC Submissions </h1>
                        <Link href={"/operations/users/kyc"} className="text-primary">View All</Link>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]"> Name </TableHead>
                                <TableHead className=""> Email / Phone </TableHead>
                                <TableHead className=""> Created At </TableHead>
                                <TableHead className=""> Action </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {kyc.map((k) => (
                                <TableRow key={k.id}>
                                    <TableCell className="w-[100px]"> {k.first_name} {k.last_name} </TableCell>
                                    <TableCell className=""> {k.email ? k.email : k.phone_number} </TableCell>
                                    <TableCell className=""> {k.created_at.toLocaleDateString()} </TableCell>
                                    <TableCell className=""> <Link href={`/operations/users/` + (k.email ? k.email : k.phone_number)} className="text-primary">View</Link> </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div>
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold"> OnGoing Trips </h1>
                    </div>
                    <div className="flex items-start space-x-2 rounded-lg border p-3">
                        <Avatar>
                            <AvatarImage src={"/placeholder.svg"} alt={""} />
                            <AvatarFallback>
                                <CarIcon />
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium leading-none">{"Toyota Camry"}</p>
                                <Badge variant="outline" className="text-xs">
                                    {"Ongoing"}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Driver: {"Samson Wangiri"}</p>
                            <div className="flex items-center text-xs text-muted-foreground">
                                <MapPinIcon className="mr-1 h-3 w-3" />
                                <span>
                                    {"Nairobi"} → {"Mombasa"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center">
                                    <CalendarIcon className="mr-1 h-3 w-3" />
                                    <span>{""}</span>
                                </div>
                                <span>{"KBL 832M"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}