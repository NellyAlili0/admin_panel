"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Clock,
  MapPin,
  Car,
  Users,
  CalendarPlus2Icon as CalendarIcon2,
  Plus,
  X,
} from "lucide-react";

export function AssignRidePage({
  drivers,
  students,
}: {
  drivers: any;
  students: any;
}) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  // Function to handle individual date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDates((prev) => {
      const dateExists = prev.some(
        (d) => d.toDateString() === date.toDateString()
      );

      if (dateExists) {
        return prev.filter((d) => d.toDateString() !== date.toDateString());
      } else {
        return [...prev, date];
      }
    });
  };

  // Function to handle driver selection
  const handleDriverSelect = (driverId: string) => {
    setSelectedDriver(driverId);
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl flex flex-col gap-4">
      <h1 className="text-3xl font-bold mb-6">Assign Ride</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Driver Selection */}
        <div className="lg:col-span-1 space-y-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Driver</CardTitle>
              <CardDescription>
                Choose a driver and vehicle for this ride
              </CardDescription>
            </CardHeader>
            {drivers.length > 0 ? (
              <CardContent className="space-y-2">
                {drivers.map((driver: any) => (
                  <div
                    key={driver.id}
                    className={cn(
                      "border rounded-lg p-2 cursor-pointer transition-all",
                      selectedDriver === driver.id
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    )}
                    onClick={() => handleDriverSelect(driver.id)}
                  >
                    <div className="flex items-start gap-3">
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
                      <div className="flex flex-col gap-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{driver.name}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Car className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {driver.vehicle.name}
                              </span>
                            </div>
                          </div>
                          {selectedDriver === driver.id && (
                            <Badge className="bg-primary">Selected</Badge>
                          )}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            License:
                          </span>{" "}
                          {driver.vehicle.licensePlate}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Seats:</span>{" "}
                          <span className="font-medium text-green-600">
                            {driver.vehicle.availableSeats}
                          </span>
                          /{driver.vehicle.seatCapacity} available
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            ) : (
              <CardContent className="min-h-[200px] flex items-center justify-center">
                <p>No drivers available</p>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ride Type</CardTitle>
              <CardDescription>
                Select the type of transportation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup defaultValue="private" className="space-y-3">
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private" className="flex-1 cursor-pointer">
                    <div className="font-medium">Private</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="carpool" id="carpool" />
                  <Label htmlFor="carpool" className="flex-1 cursor-pointer">
                    <div className="font-medium">Carpool</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="bus" id="bus" />
                  <Label htmlFor="bus" className="flex-1 cursor-pointer">
                    <div className="font-medium">Bus</div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Ride Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ride Details</CardTitle>
              <CardDescription>
                Enter pickup and dropoff information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pickup Information */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                    <MapPin className="h-3 w-3 text-green-600" />
                  </div>
                  Pickup Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pickup-location">Pickup Location</Label>
                    <Input id="pickup-location" placeholder="Enter address" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickup-time">Pickup Time</Label>
                    <div className="relative">
                      <Input id="pickup-time" placeholder="Select time" />
                      <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickup-lat">Latitude</Label>
                    <Input id="pickup-lat" placeholder="e.g. -1.2921" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickup-lng">Longitude</Label>
                    <Input id="pickup-lng" placeholder="e.g. 36.8219" />
                  </div>
                </div>
              </div>

              {/* Dropoff Information */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                    <MapPin className="h-3 w-3 text-red-600" />
                  </div>
                  Dropoff Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dropoff-location">Dropoff Location</Label>
                    <Input id="dropoff-location" placeholder="Enter address" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dropoff-time">Dropoff Time</Label>
                    <div className="relative">
                      <Input id="dropoff-time" placeholder="Select time" />
                      <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dropoff-lat">Latitude</Label>
                    <Input id="dropoff-lat" placeholder="e.g. -1.2921" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dropoff-lng">Longitude</Label>
                    <Input id="dropoff-lng" placeholder="e.g. 36.8219" />
                  </div>
                </div>
              </div>

              {/* Administrator Comment */}
              <div className="space-y-2">
                <Label htmlFor="admin-comment">Administrator Comment</Label>
                <Textarea
                  id="admin-comment"
                  placeholder="Add any special instructions or notes about this ride"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Schedule Ride</CardTitle>
            <CardDescription>
              Select dates for this ride assignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="individual" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger
                  value="individual"
                  className="flex items-center gap-2"
                >
                  <CalendarIcon2 className="h-4 w-4" />
                  <span>Individual Dates</span>
                </TabsTrigger>
                <TabsTrigger value="range" className="flex items-center gap-2">
                  <CalendarIcon2 className="h-4 w-4" />
                  <span>Date Range</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="individual" className="space-y-4">
                <div className="border rounded-lg p-4">
                  <Calendar
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={(dates) => {
                      if (dates && !Array.isArray(dates)) {
                        handleDateSelect(dates);
                      }
                    }}
                    className="rounded-md border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Selected Dates</Label>
                  <div className="border rounded-lg p-3 min-h-[60px]">
                    {selectedDates.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No dates selected
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedDates.map((date, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {format(date, "MMM d, yyyy")}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDateSelect(date);
                              }}
                              className="ml-1 h-4 w-4 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/30"
                            >
                              <X className="h-2 w-2" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="recurring" />
                    <Label htmlFor="recurring">
                      Make this a recurring ride
                    </Label>
                  </div>
                  <div className="pl-6 pt-2 grid grid-cols-2 md:grid-cols-7 gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox id={`day-${day}`} />
                          <Label htmlFor={`day-${day}`}>{day}</Label>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="range" className="space-y-4">
                <div className="border rounded-lg p-4">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    //   onSelect={(value) => setDateRange(value)}
                    className="rounded-md border"
                    numberOfMonths={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Selected Range</Label>
                  <div className="border rounded-lg p-3 min-h-[60px]">
                    {!dateRange.from ? (
                      <p className="text-sm text-muted-foreground">
                        No date range selected
                      </p>
                    ) : !dateRange.to ? (
                      <p className="text-sm">
                        <span className="font-medium">
                          {format(dateRange.from, "MMM d, yyyy")}
                        </span>{" "}
                        — Select end date
                      </p>
                    ) : (
                      <p className="text-sm">
                        <span className="font-medium">
                          {format(dateRange.from, "MMM d, yyyy")}
                        </span>{" "}
                        —{" "}
                        <span className="font-medium">
                          {format(dateRange.to, "MMM d, yyyy")}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="exclude-weekends" />
                    <Label htmlFor="exclude-weekends">Exclude weekends</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Exclude Specific Dates</Label>
                  <div className="flex items-center space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 border-dashed"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Add Date
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Passengers</CardTitle>
            <CardDescription>Assign passengers to this ride</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Assigned Passengers</span>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Passenger
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  {students.length > 0 ? <div className="space-y-4">
                    <div className="max-h-[200px] overflow-y-auto space-y-2">
                      {/* Example passengers */}
                      {students.map((student: any, i: number) => (
                        <div key={i} className="flex items-center space-x-2">
                          <Checkbox id={`passenger-${i}`} />
                          <Label
                            htmlFor={`passenger-${i}`}
                            className="flex items-center gap-2"
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>
                                {student.student_name
                                  .split(" ")
                                  .map((n: any) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            {student.student_name} ({student.parent_name})
                          </Label>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full">Add Selected</Button>
                  </div> : <p>No students available</p>}
                </PopoverContent>
              </Popover>
            </div>

            <div className="border rounded-lg p-3 min-h-[100px]">
              <p className="text-sm text-muted-foreground">
                No passengers assigned yet
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button variant="ghost" disabled={true}>Assign Ride</Button>
      </div>
    </div>
  );
}
