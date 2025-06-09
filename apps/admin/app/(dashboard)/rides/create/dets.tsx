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
import { Checkbox } from "@/components/ui/checkbox";
import { format, differenceInCalendarDays, getDay } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Clock,
  MapPin,
  Car,
  User,
  CalendarRange,
  MapIcon,
  ArrowRight,
  CheckCheckIcon,
} from "lucide-react";
import { assignRide } from "./action";
import MapPreview from "./mapPreview";
import { toast } from "sonner";
import React, { useRef, useCallback } from "react";
import {
  GoogleMap,
  useLoadScript,
  StandaloneSearchBox,
  LoadScript,
} from "@react-google-maps/api";
const libraries = ["places"];
export default function AssignRidePage({
  drivers,
  students,
}: {
  drivers: any;
  students: any;
}) {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [selectedPassenger, setSelectedPassenger] = useState<string | null>(
    null
  );
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyCSmmBwrPkYacuOtfp6Wtlg7QGbnq2aUFE", // Replace with your actual API key
    libraries: ["places"],
  });
  const [searchBox, setSearchBox] = useState<any | null>(null);
  const [searchBoxRef, setSearchBoxRef] = useState<any | null>(null);
  // Callback function when the search box loads
  // const onLoad = useCallback((ref: StandaloneSearchBox) => {
  //   setSearchBox(ref);
  //   // Set component restrictions to Kenya (ISO 3166-1 Alpha-2 code for Kenya is 'KE')
  //   // This restricts the autocomplete suggestions to Kenya.
  //   searchBoxRef.current?.setComponentRestrictions({ country: "KE" });
  // }, []);

  const [pickupDetails, setPickupDetails] = useState({
    location: "",
    time: "",
    lat: "",
    lng: "",
  });
  const [dropoffDetails, setDropoffDetails] = useState({
    location: "",
    time: "",
    lat: "",
    lng: "",
  });
  const [type, setType] = useState("private");
  const [cost, setCost] = useState("1000");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  const onPlacesChanged = () => {
    const places = searchBox?.getPlaces();
    const selectedPlace = places[0]; // Get the first selected place

    // Update state with the place name and coordinates
    setPickupDetails({
      location: selectedPlace.name,
      time: pickupDetails.time,
      lat: selectedPlace.geometry.location.lat(),
      lng: selectedPlace.geometry.location.lng(),
    });
  };
  const onDropoffPlacesChanged = () => {
    const places = searchBoxRef?.getPlaces();
    const selectedPlace = places[0]; // Get the first selected place
    let newDropoffDetails = {
      location: selectedPlace.name,
      time: dropoffDetails.time,
      lat: selectedPlace.geometry.location.lat(),
      lng: selectedPlace.geometry.location.lng(),
    };
    setDropoffDetails(newDropoffDetails);
  };
  const onSBLoad = (ref: any) => {
    setSearchBox(ref);
  };
  const onDropoffSBLoad = (ref: any) => {
    setSearchBoxRef(ref);
  };
  // Calculate weekdays between two dates
  const getWeekdayCount = (from: Date | undefined, to: Date | undefined) => {
    if (!from || !to) return 0;

    let count = 0;
    const currentDate = new Date(from);

    while (currentDate <= to) {
      const day = getDay(currentDate);
      // Check if day is Monday (1) through Friday (5)
      if (day > 0 && day < 6) {
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
  };

  const handleAssignRide = async () => {
    setLoading(true);
    let formData = new FormData();
    formData.append("driver_id", selectedDriver!);
    formData.append("student_id", selectedPassenger!);
    formData.append("pickup_location", pickupDetails.location);
    formData.append("pickup_time", pickupDetails.time);
    formData.append("pickup_lat", pickupDetails.lat);
    formData.append("pickup_lng", pickupDetails.lng);
    formData.append("dropoff_location", dropoffDetails.location);
    formData.append("dropoff_time", dropoffDetails.time);
    formData.append("dropoff_lat", dropoffDetails.lat);
    formData.append("dropoff_lng", dropoffDetails.lng);
    formData.append("start_date", dateRange.from!.toDateString());
    formData.append("end_date", dateRange.to!.toDateString());
    formData.append("type", type);
    formData.append("cost", cost);
    formData.append("comments", comments);
    const result = await assignRide(formData);
    if (result.message) {
      toast(result.message);
    }
    setLoading(false);
  };

  // Function to handle driver selection
  const handleDriverSelect = (driverId: string) => {
    setSelectedDriver(driverId);
  };

  // Function to handle passenger selection
  const handlePassengerSelect = (passengerId: string) => {
    setSelectedPassenger(passengerId);
  };

  // Function to handle pickup details submission
  const handlePickupSubmit = (details: typeof pickupDetails) => {
    setPickupDetails(details);
  };

  // Function to handle dropoff details submission
  const handleDropoffSubmit = (details: typeof dropoffDetails) => {
    setDropoffDetails(details);
  };

  // Distance and cost calculation
  const distance = 5; // km (mock value)
  const costPerKm = 250; // KES
  const estimatedCost = distance * costPerKm;

  return (
    <div className="py-6 px-4 max-w-7xl">
      <LoadScript
        googleMapsApiKey="AIzaSyCSmmBwrPkYacuOtfp6Wtlg7QGbnq2aUFE"
        libraries={["places"]}
      >
        <h1 className="text-3xl font-bold mb-6">Assign Ride</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Driver Selection */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Driver</CardTitle>
                <CardDescription>
                  Choose a driver and vehicle for this ride
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {drivers.map((driver) => (
                  <div
                    key={driver.driver_id}
                    className={cn(
                      "border rounded-lg p-4 cursor-pointer transition-all",
                      selectedDriver === driver.driver_id
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    )}
                    onClick={() => handleDriverSelect(driver.driver_id)}
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
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{driver.name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span className="flex items-center">
                                {driver.vehicle_name} (
                                {driver.registration_number})
                              </span>
                            </div>
                          </div>
                          {selectedDriver === driver.id && (
                            <Badge className="bg-primary">
                              <CheckCheckIcon />
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
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

            <Card>
              <CardHeader>
                <CardTitle>Cost</CardTitle>
                <CardDescription>Set the ride cost</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost (KES)</Label>
                  <Input
                    id="cost"
                    type="number"
                    onChange={(e) => setCost(e.target.value)}
                    defaultValue={cost}
                  />
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Cost Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Distance:</span>
                      <span>{distance} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate:</span>
                      <span>{costPerKm} KES/km</span>
                    </div>
                    <div className="flex justify-between font-medium pt-1 border-t mt-1">
                      <span>Estimated Cost:</span>
                      <span>{estimatedCost} KES</span>
                    </div>
                  </div>
                </div>
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
                {/* Pickup and Dropoff Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pickup Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                            <MapPin className="h-3 w-3 text-green-600" />
                          </div>
                          <h3 className="font-medium">Pickup Information</h3>
                        </div>
                        {pickupDetails.location ? (
                          <div className="space-y-1 pl-8">
                            <p className="text-sm">{pickupDetails.location}</p>
                            <p className="text-sm text-muted-foreground">
                              {pickupDetails.time}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground pl-8">
                            Click to add pickup details
                          </p>
                        )}
                      </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Pickup Details</DialogTitle>
                        <DialogDescription>
                          Enter the pickup location and time
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <StandaloneSearchBox
                            onPlacesChanged={onPlacesChanged}
                            onLoad={onSBLoad}
                          >
                            <input
                              type="text"
                              id="location-search"
                              placeholder="Start typing a place name..."
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            />
                          </StandaloneSearchBox>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pickup-time">Pickup Time</Label>
                          <div className="">
                            <Input
                              id="pickup-time"
                              placeholder="Select time"
                              // type="datetime-local"
                              type="time"
                              required
                              step="3600"
                              onChange={(e) =>
                                setPickupDetails({
                                  ...pickupDetails,
                                  time: e.target.value,
                                })
                              }
                              defaultValue={pickupDetails.time}
                            />
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Dropoff Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                            <MapPin className="h-3 w-3 text-red-600" />
                          </div>
                          <h3 className="font-medium">Dropoff Information</h3>
                        </div>
                        {dropoffDetails.location ? (
                          <div className="space-y-1 pl-8">
                            <p className="text-sm">{dropoffDetails.location}</p>
                            <p className="text-sm text-muted-foreground">
                              {dropoffDetails.time}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground pl-8">
                            Click to add dropoff details
                          </p>
                        )}
                      </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Dropoff Details</DialogTitle>
                        <DialogDescription>
                          Enter the dropoff location and time
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <StandaloneSearchBox
                            onLoad={onDropoffSBLoad}
                            onPlacesChanged={onDropoffPlacesChanged}
                          >
                            <input
                              type="text"
                              id="location-search"
                              placeholder="Start typing a place name..."
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            />
                          </StandaloneSearchBox>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dropoff-time">Dropoff Time</Label>
                          <div className="">
                            <Input
                              id="dropoff-time"
                              placeholder="Select time"
                              type="time"
                              required
                              step="3600"
                              onChange={(e) =>
                                setDropoffDetails({
                                  ...dropoffDetails,
                                  time: e.target.value,
                                })
                              }
                              defaultValue={dropoffDetails.time}
                            />
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Route Map */}
                {pickupDetails.lat &&
                  pickupDetails.lng &&
                  dropoffDetails.lat &&
                  dropoffDetails.lng && (
                    <div className="space-y-3 border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Route Map</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <div className="h-3 w-3 rounded-full bg-green-500"></div>
                            <span>{pickupDetails.location}</span>
                          </div>
                          <ArrowRight className="h-4 w-4" />
                          <div className="flex items-center gap-1">
                            <div className="h-3 w-3 rounded-full bg-red-500"></div>
                            <span>{dropoffDetails.location}</span>
                          </div>
                        </div>
                      </div>

                      <MapPreview
                        pickup_lat={pickupDetails.lat}
                        pickup_lng={pickupDetails.lng}
                        dropoff_lat={dropoffDetails.lat}
                        dropoff_lng={dropoffDetails.lng}
                      />
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-green-500" />
                          <span>{pickupDetails.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-red-500" />
                          <span>{dropoffDetails.location}</span>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Administrator Comment */}
                <div className="space-y-2">
                  <Label htmlFor="admin-comment">Administrator Comment</Label>
                  <Textarea
                    id="admin-comment"
                    placeholder="Add any special instructions or notes about this ride"
                    className="min-h-[100px]"
                    onChange={(e) => setComments(e.target.value)}
                    defaultValue={comments}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule Ride</CardTitle>
                <CardDescription>
                  Select date range for this ride assignment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarRange className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Select Date Range</h3>
                  </div>
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(value: any) => setDateRange(value)}
                    className="rounded-md border"
                    numberOfMonths={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Selected Range</Label>
                  <div className="border rounded-lg p-3">
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
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-medium">
                            {format(dateRange.from, "MMM d, yyyy")}
                          </span>{" "}
                          —{" "}
                          <span className="font-medium">
                            {format(dateRange.to, "MMM d, yyyy")}
                          </span>
                        </p>
                        <div className="flex items-center gap-4 text-sm pt-2 border-t">
                          <div>
                            <span className="text-muted-foreground">
                              Total days:
                            </span>{" "}
                            <span className="font-medium">
                              {differenceInCalendarDays(
                                dateRange.to,
                                dateRange.from
                              ) + 1}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Weekdays:
                            </span>{" "}
                            <span className="font-medium">
                              {getWeekdayCount(dateRange.from, dateRange.to)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assign Passenger</CardTitle>
                <CardDescription>
                  Select a passenger for this ride
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {students.map((student: any) => (
                    <div
                      key={student.student_id}
                      className={cn(
                        "border rounded-lg p-3 cursor-pointer transition-all",
                        selectedPassenger === student.student_id
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      )}
                      onClick={() => handlePassengerSelect(student.student_id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={student.avatar || "/placeholder.svg"}
                            alt={student.student_name}
                          />
                          <AvatarFallback>
                            {student.student_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">
                            {student.student_name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{student.parent_name}</span>
                            <span>•</span>
                            <span>{student.parent_email}</span>
                          </div>
                        </div>
                        {selectedPassenger === student.student_id && (
                          <Badge className="ml-auto bg-primary">
                            <CheckCheckIcon />
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button
            onClick={handleAssignRide}
            disabled={
              loading ||
              !pickupDetails.location ||
              !dropoffDetails.location ||
              !selectedDriver ||
              !selectedPassenger ||
              !dateRange.from ||
              !dateRange.to ||
              !pickupDetails.time ||
              !dropoffDetails.time ||
              !pickupDetails.lat ||
              !pickupDetails.lng ||
              !dropoffDetails.lat ||
              !dropoffDetails.lng ||
              !type
            }
          >
            Assign Ride
          </Button>
        </div>
      </LoadScript>
    </div>
  );
}
