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
  X,
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
  Autocomplete,
} from "@react-google-maps/api";

const libraries: "places"[] = ["places"];

// Updated type definitions to match database schema
interface Driver {
  id: number; // user.id
  name: string | null; // user.name
  email: string | null; // user.email
  phone_number: string | null; // user.phone_number
  vehicle_id: number; // vehicle.id
  vehicle_name: string | null; // vehicle.vehicle_name
  registration_number: string; // vehicle.registration_number
  vehicle_type: "Bus" | "Van" | "Car"; // vehicle.vehicle_type
  seat_count: number; // vehicle.seat_count
  available_seats: number; // vehicle.available_seats
  avatar?: string; // Optional for UI
}

interface Student {
  id: number; // student.id
  name: string; // student.name
  gender: "Female" | "Male"; // student.gender
  address: string | null; // student.address
  parent_id: number | null; // student.parentId
  parent_name: string | null; // user.name (parent)
  parent_email: string | null; // user.email (parent)
  parent_phone: string | null; // user.phone_number (parent)
  school_id: number | null; // student.schoolId
  school_name?: string | null; // school.name
  avatar?: string; // Optional for UI
}

export default function AssignRidePage({
  drivers,
  students,
}: {
  drivers: Driver[];
  students: Student[];
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

  const [searchBox, setSearchBox] = useState<any | null>(null);
  const [searchBoxRef, setSearchBoxRef] = useState<any | null>(null);

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
  const [type, setType] = useState("Private"); // Updated to match RideSchedule.kind
  const [cost, setCost] = useState("1000");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);

  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showDropoffModal, setShowDropoffModal] = useState(false);
  const [pickupSearchBoxRef, setPickupSearchBoxRef] = useState<any | null>(
    null
  );
  const [dropoffSearchBoxRef, setDropoffSearchBoxRef] = useState<any | null>(
    null
  );
  const onPickupPlacesChanged = () => {
    console.log("Places changed - pickup");
    const place = pickupSearchBoxRef?.getPlace();
    console.log(place);

    setPickupDetails({
      ...pickupDetails,
      location: place.formatted_address,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    });
  };

  const onDropoffPlacesChanged = () => {
    console.log("Places changed- dropoff");

    const place = dropoffSearchBoxRef?.getPlace();

    let newDropoffDetails = {
      ...dropoffDetails,
      location: place.formatted_address,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    setDropoffDetails(newDropoffDetails);
  };

  const onPickupSBLoad = (ref: any) => {
    console.log("✅ pickup loaded");
    setPickupSearchBoxRef(ref);
  };

  const onDropoffSBLoad = (ref: any) => {
    console.log("✅ dropoff loaded");
    setDropoffSearchBoxRef(ref);
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
    formData.append("start_date", dateRange.from!.toISOString().split("T")[0]); // Format as YYYY-MM-DD
    formData.append("end_date", dateRange.to!.toISOString().split("T")[0]); // Format as YYYY-MM-DD
    formData.append("type", type);
    formData.append("cost", cost);
    formData.append("comments", comments);

    try {
      const result = await assignRide(formData);
      if (result?.message) {
        toast(result.message);
      } else {
        toast.success("Ride assigned successfully!");
      }
    } catch (error) {
      toast.error("Ride assigned successfully!");
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
                    key={driver.id}
                    className={cn(
                      "border rounded-lg p-4 cursor-pointer transition-all",
                      selectedDriver === driver.id.toString()
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    )}
                    onClick={() => handleDriverSelect(driver.id.toString())}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={driver.avatar || "/placeholder.svg"}
                          alt={driver.name || "Driver"}
                        />
                        <AvatarFallback>
                          {driver.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "D"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">
                              {driver.name || "Unknown Driver"}
                            </h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span className="flex items-center">
                                {driver.vehicle_name} (
                                {driver.registration_number})
                              </span>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <span>{driver.vehicle_type}</span>
                              <span className="mx-1">•</span>
                              <span>
                                {driver.available_seats}/{driver.seat_count}{" "}
                                seats available
                              </span>
                            </div>
                          </div>
                          {selectedDriver === driver.id.toString() && (
                            <Badge className="bg-primary">
                              <CheckCheckIcon className="h-3 w-3" />
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
                <RadioGroup
                  value={type}
                  onValueChange={setType}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="Private" id="private" />
                    <Label htmlFor="private" className="flex-1 cursor-pointer">
                      <div className="font-medium">Private</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="Carpool" id="carpool" />
                    <Label htmlFor="carpool" className="flex-1 cursor-pointer">
                      <div className="font-medium">Carpool</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="Bus" id="bus" />
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
                    value={cost}
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
                  <>
                    {/* Trigger */}
                    <div
                      className="border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-all"
                      onClick={() => setShowPickupModal(true)}
                    >
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

                    {/* Modal */}
                    {showPickupModal && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                          {/* Close button */}
                          <button
                            onClick={() => setShowPickupModal(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-5 w-5" />
                          </button>

                          {/* Header */}
                          <div className="mb-4">
                            <h2 className="text-lg font-semibold">
                              Pickup Details
                            </h2>
                            <p className="text-sm text-muted-foreground">
                              Enter the pickup location and time
                            </p>
                          </div>

                          {/* Body */}
                          <div className="grid gap-4 py-2">
                            {/* Location Search */}
                            <div className="space-y-2">
                              <Autocomplete
                                onPlaceChanged={onPickupPlacesChanged}
                                onLoad={onPickupSBLoad}
                              >
                                <input
                                  type="text"
                                  ref={pickupRef}
                                  id="location-search"
                                  placeholder="Start typing a place name..."
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                />
                              </Autocomplete>
                            </div>

                            {/* Time Picker */}
                            <div className="space-y-2">
                              <label
                                htmlFor="pickup-time"
                                className="text-sm font-medium text-gray-700"
                              >
                                Pickup Time
                              </label>
                              <input
                                id="pickup-time"
                                type="time"
                                required
                                step="3600"
                                value={pickupDetails.time}
                                onChange={(e) =>
                                  setPickupDetails({
                                    ...pickupDetails,
                                    time: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="mt-6 flex justify-end">
                            <button
                              onClick={() => setShowPickupModal(false)}
                              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                  <>
                    {/* Trigger */}
                    <div
                      className="border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-all"
                      onClick={() => setShowDropoffModal(true)}
                    >
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

                    {/* Modal */}
                    {showDropoffModal && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                          {/* Close button */}
                          <button
                            onClick={() => setShowDropoffModal(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-5 w-5" />
                          </button>

                          {/* Header */}
                          <div className="mb-4">
                            <h2 className="text-lg font-semibold">
                              Dropoff Details
                            </h2>
                            <p className="text-sm text-muted-foreground">
                              Enter the dropoff location and time
                            </p>
                          </div>

                          {/* Body */}
                          <div className="grid gap-4 py-2">
                            {/* Location Search */}
                            <div className="space-y-2">
                              <Autocomplete
                                onPlaceChanged={onDropoffPlacesChanged}
                                onLoad={onDropoffSBLoad}
                              >
                                <input
                                  type="text"
                                  ref={dropoffRef}
                                  id="location-search"
                                  placeholder="Start typing a place name..."
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                />
                              </Autocomplete>
                            </div>

                            {/* Time Picker */}
                            <div className="space-y-2">
                              <label
                                htmlFor="dropoff-time"
                                className="text-sm font-medium text-gray-700"
                              >
                                Dropoff Time
                              </label>
                              <input
                                id="dropoff-time"
                                type="time"
                                required
                                step="3600"
                                value={dropoffDetails.time}
                                onChange={(e) =>
                                  setDropoffDetails({
                                    ...dropoffDetails,
                                    time: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="mt-6 flex justify-end">
                            <button
                              onClick={() => setShowDropoffModal(false)}
                              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>

                  {/* %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% */}
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
                      key={student.id}
                      className={cn(
                        "border rounded-lg p-3 cursor-pointer transition-all",
                        selectedPassenger === student.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      )}
                      onClick={() => handlePassengerSelect(student.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={student?.profile_picture || "/placeholder.svg"}
                            alt={student?.name}
                          />
                          <AvatarFallback>
                            {student?.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{student?.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{student?.name}</span>
                            <span>•</span>
                            <span>{student?.parentId?.email}</span>
                          </div>
                        </div>
                        {selectedPassenger === student?.id && (
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
            {loading ? "Assigning..." : "Assign Ride"}
          </Button>
        </div>
      </LoadScript>
    </div>
  );
}
