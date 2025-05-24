"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Car,
  User,
  CreditCard,
  FileText,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import GenTable from "@/components/tables";
import MapPreview from "../create/mapPreview";

export function RideDetailsPage({
  details,
  student,
  vehicle,
  driver,
  guardian,
  tripHistory,
  route,
}: any) {
  // Function to render status badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Completed
          </Badge>
        );
      case "Absent":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Absent
          </Badge>
        );
      case "Delayed":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200"
          >
            Delayed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="">
      {/* <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">Ride Details</h1>
          <p className="text-muted-foreground">ID: {rideDetails.id}</p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Badge className="text-base py-1 px-3 bg-green-500">
            {rideDetails.status}
          </Badge>
          <Button variant="outline">Edit Ride</Button>
          <Button variant="destructive">Cancel Ride</Button>
        </div>
      </div> */}

      {/* Main Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Vehicle and Driver Information */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle & Driver</CardTitle>
            <CardDescription>
              Information about the assigned vehicle and driver
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Vehicle Information */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span>Vehicle Information</span>
              </h3>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-32 rounded-md overflow-hidden">
                  <img
                    src={
                      vehicle.vehicle_image_url ??
                      "https://placehold.co/600x400?text=Vehicle+Image"
                    }
                    alt="Vehicle"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">{vehicle.vehicle_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.vehicle_type}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-sm">
                    <Badge variant="outline">
                      {vehicle.registration_number}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Seat Capacity:</span>{" "}
                  <span className="font-medium">{vehicle.seat_count}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Available Seats:
                  </span>{" "}
                  <span className="font-medium text-green-600">
                    {vehicle.available_seats}
                  </span>
                </div>
              </div>
            </div>

            {/* Driver Information */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Driver Information</span>
              </h3>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={driver.avatar || "/placeholder.svg"}
                    alt={driver.name}
                  />
                  <AvatarFallback>
                    {driver.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{driver.name}</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="flex items-center">{driver.email}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{driver.phone_number}</span>
                </div>
              </div>
              <Link href={`/drivers/${driver.email}`}>View Driver Profile</Link>
            </div>
          </CardContent>
        </Card>

        {/* Student and Guardian Information */}
        <Card>
          <CardHeader>
            <CardTitle>Student & Guardian</CardTitle>
            <CardDescription>
              Information about the student and guardian
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Student Information */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Student Information</span>
              </h3>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={student.profile_picture || "/placeholder.svg"}
                    alt={student.name}
                  />
                  <AvatarFallback>
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{student.name}</h4>
                </div>
              </div>
              <Link href={`/parents/students/${student.id}`}>
                View Student Profile
              </Link>
            </div>

            {/* Guardian Information */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Guardian Information</span>
              </h3>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={guardian.avatar || "/placeholder.svg"}
                    alt={guardian.name}
                  />
                  <AvatarFallback>
                    {guardian.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{guardian.name}</h4>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{guardian.phone_number}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{guardian.email}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ride Schedule and Cost */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule & Cost</CardTitle>
            <CardDescription>
              Ride schedule and payment information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Schedule Information */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Schedule Information</span>
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Date:</span>
                  <span className="font-medium">
                    {format(details.schedule.dates[0], "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End Date:</span>
                  <span className="font-medium">
                    {format(
                      details.schedule.dates[details.schedule.dates.length - 1],
                      "MMM d, yyyy"
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days:</span>
                  <span className="font-medium">
                    {details.schedule.dates.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Cost Information */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>Cost Information</span>
              </h3>
              <div className="p-4 bg-primary/5 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ride Type:</span>
                    <span className="font-medium">{details.schedule.kind}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t mt-2">
                    <span className="font-medium">Total Cost:</span>
                    <span className="font-bold text-lg">
                      KES {details.schedule.cost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Comments */}
            <div className="space-y-2 pt-4 border-t">
              <h3 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>Administrator Comments</span>
              </h3>
              <div className="p-3 border rounded-lg text-sm">
                {details.comments || "No comments provided."}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route Map */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Route Information</CardTitle>
          <CardDescription>
            Pickup and dropoff locations with route map
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pickup and Dropoff Information */}
            <div className="space-y-6">
              {/* Pickup Information */}
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                    <MapPin className="h-3 w-3 text-green-600" />
                  </div>
                  <span>Pickup Information</span>
                </h3>
                <div className="pl-8 space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{details.schedule.pickup.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{details.schedule.pickup.start_time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      Coordinates: {details.schedule.pickup.latitude},{" "}
                      {details.schedule.pickup.longitude}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dropoff Information */}
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-medium flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                    <MapPin className="h-3 w-3 text-red-600" />
                  </div>
                  <span>Dropoff Information</span>
                </h3>
                <div className="pl-8 space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{details.schedule.dropoff.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{details.schedule.dropoff.start_time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      Coordinates: {details.schedule.dropoff.latitude},{" "}
                      {details.schedule.dropoff.longitude}
                    </span>
                  </div>
                </div>
              </div>

              {/* Route Summary
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-medium">Route Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance:</span>
                    <span className="font-medium">
                      {(route.routes[0].distanceMeters / 1000).toFixed(2)} km
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Estimated Duration:
                    </span>
                    <span className="font-medium">
                      {route.routes[0].duration}
                    </span>
                  </div>
                </div>
              </div> */}
            </div>

            {/* Map */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Route Map</h3>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span>Pickup</span>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span>Dropoff</span>
                  </div>
                </div>
              </div>

              <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border">
                <MapPreview
                  pickup_lat={details.schedule.pickup.latitude}
                  pickup_lng={details.schedule.pickup.longitude}
                  dropoff_lat={details.schedule.dropoff.latitude}
                  dropoff_lng={details.schedule.dropoff.longitude}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ride History */}
      <Card>
        <CardHeader>
          <CardTitle>Ride History</CardTitle>
          <CardDescription>
            Past ride records for this assignment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GenTable
            title="Trip History"
            cols={["passenger", "kind", "start_time", "end_time", "status"]}
            data={tripHistory}
            baseLink="/rides/"
            uniqueKey=""
          />
        </CardContent>
      </Card>
    </div>
  );
}
