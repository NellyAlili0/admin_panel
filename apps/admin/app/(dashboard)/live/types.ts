// Student shape as returned by your query
export interface StudentDTO {
  id: number;
  schoolId: number | null;
  name: string;
  address: string | null;
}

// Daily ride shape as returned by your query
export interface DailyRideDTO {
  id: number;
  status: "Ongoing" | "Inactive" | "Started" | "Finished";
  kind: "Pickup" | "Dropoff";
  date: Date;
  available_seats: number;

  rideId: number;
  studentId: number;
  studentName: string;

  driverId: number;
  driverName: string | null;
  driverPhone: string | null;
  driverEmail: string | null;

  vehicleId: number | null;
  vehicleReg: string | null;
}

// Driver location shape as returned by your query
export interface DriverLocationDTO {
  id: number;
  driverId: number;
  driverName: string | null;
  driverPhone: string | null;
  latitude: number;
  longitude: number;
  timestamp: Date;
}

// The driver marker used inside the map
export interface DriverMarkerData {
  driverId: number;
  name: string | null;
  phone: string | null;
  vehicleReg: string | null;
  lat: number;
  lng: number;
  lastUpdate: Date;
  students: string[];
  status?: "Ongoing" | "Finished" | "Inactive"; // Add this line
}
