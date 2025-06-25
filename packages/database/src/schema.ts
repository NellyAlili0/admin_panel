import { ColumnType, Generated, JSONColumnType } from "kysely";

import { sql } from "kysely";

export interface Database {
  user: UserTable;
  kyc: KYCTable;
  admin: AdminTable;
  school: SchoolTable;
  student: StudentTable;
  vehicle: VehicleTable;
  ride: RideTable;
  daily_ride: DailyRideTable;
  location: LocationTable;
  payment: PaymentTable;
  notification: NotificationTable;
  onboarding: OnboardingFormTable;
}

export interface UserTable {
  id: Generated<number>;
  name: string;
  email: string | null;
  password: string;
  phone_number: string | null;
  kind: "Parent" | "Driver";
  meta: JSONColumnType<{
    payments: {
      kind: "Bank" | "M-Pesa";
      bank: string | null;
      account_number: string | null;
      account_name: string | null;
    };
    county: string | null;
    neighborhood: string | null;
    notifications: {
      when_bus_leaves: boolean;
      when_bus_makes_home_drop_off: boolean;
      when_bus_make_home_pickup: boolean;
      when_bus_arrives: boolean;
      when_bus_is_1km_away: boolean;
      when_bus_is_0_5km_away: boolean;
    };
  }> | null;
  wallet_balance: number;
  is_kyc_verified: boolean;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
  status: "Active" | "Inactive";
}

export interface KYCTable {
  id: Generated<number>;
  user_id: number;
  national_id_front: string | null;
  national_id_back: string | null;
  passport_photo: string | null;
  driving_license: string | null;
  certificate_of_good_conduct: string | null;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
  comments: string | null;
  is_verified: boolean;
}

export interface AdminTable {
  id: Generated<number>;
  name: string;
  email: string | null;
  password: string;
  role: "Finance" | "Admin" | "Operations";
  created_at: ColumnType<Date, string | undefined, never>;
}

export interface SchoolTable {
  id: Generated<number>;
  name: string;
  location: string | null;
  comments: string | null;
  url: string | null; // <- NEW FIELD
  meta: JSONColumnType<{
    administrator_name: string | null;
    administrator_phone: string | null;
    administrator_email: string | null;
    official_email: string | null;
    logo: string | null;
    longitude: number;
    latitude: number;
  }> | null; // administrator contacts, official email, logo and more
  created_at: ColumnType<Date, string | undefined, never>;
}

export interface StudentTable {
  id: Generated<number>;
  school_id: number | null;
  parent_id: number | null;
  name: string;
  profile_picture: string | null;
  gender: "Male" | "Female";
  address: string | null;
  comments: string | null;
  meta: JSONColumnType<{}> | null;
  created_at: ColumnType<Date, string | undefined, never>;
}

export interface VehicleTable {
  id: Generated<number>;
  user_id: number | null;
  vehicle_name: string | null;
  registration_number: string;
  vehicle_type: "Bus" | "Van" | "Car";
  vehicle_model: string;
  vehicle_year: number;
  vehicle_image_url: string | null;
  seat_count: number;
  available_seats: number;
  is_inspected: boolean;
  comments: string | null;
  meta: JSONColumnType<{}> | null;
  vehicle_registration: string | null;
  insurance_certificate: string | null;
  vehicle_data: JSONColumnType<{}> | null;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
  status: "Active" | "Inactive";
}

export interface RideTable {
  id: Generated<number>;
  vehicle_id: number | null;
  driver_id: number | null;
  school_id: number | null;
  student_id: number | null;
  parent_id: number | null;
  schedule: JSONColumnType<{
    cost: number | null;
    paid: number | null;
    pickup: {
      start_time: string;
      location: string;
      latitude: number;
      longitude: number;
    };
    dropoff: {
      start_time: string;
      location: string;
      latitude: number;
      longitude: number;
    };
    comments?: string;
    dates?: string[];
    kind?: "Private" | "Carpool" | "Bus";
  }> | null;
  comments: string | null;
  admin_comments: string | null;
  meta: JSONColumnType<{}> | null;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
  status: "Requested" | "Cancelled" | "Ongoing" | "Pending" | "Completed";
}

export interface DailyRideTable {
  id: Generated<number>;
  ride_id: number;
  vehicle_id: number;
  driver_id: number | null;
  kind: "Pickup" | "Dropoff";
  date: ColumnType<Date, string | undefined>;
  start_time: ColumnType<Date, string | undefined>;
  end_time: ColumnType<Date, string | undefined>;
  comments: string | null;
  meta: JSONColumnType<{
    notifications: {
      point_five_km: boolean;
      one_km: boolean;
    };
  }> | null;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
  status: "Active" | "Inactive" | "Started" | "Finished";
}

export interface PaymentTable {
  id: Generated<number>;
  user_id: number;
  amount: number;
  kind: "Bank" | "M-Pesa";
  transaction_type: "Deposit" | "Withdrawal";
  comments: string | null;
  transaction_id: string | null;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
}

export interface LocationTable {
  id: Generated<number>;
  daily_ride_id: number;
  latitude: number;
  longitude: number;
  created_at: ColumnType<Date, string | undefined, never>;
}

export interface NotificationTable {
  id: Generated<number>;
  user_id: number;
  title: string;
  message: string;
  meta: JSONColumnType<{}> | null;
  is_read: boolean;
  kind: "Personal" | "System";
  section: "Profile" | "Rides" | "Vehicle" | "Payments" | "Other";
  created_at: ColumnType<Date, string | undefined, never>;
}

export interface OnboardingFormTable {
  id: Generated<number>;

  // Parent Info
  parent_name: string;
  parent_email: string | null;
  parent_phone: string | null;
  address: string | null;

  // Student Info
  student_name: string;
  student_gender: "Male" | "Female";
  school_id: number;
  ride_type: "dropoff" | "pickup" | "pickup & dropoff";

  created_at: ColumnType<Date, string | undefined, never>;
}
