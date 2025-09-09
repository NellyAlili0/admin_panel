import {
  Generated,
  Insertable,
  JSONColumnType,
  Selectable,
  Updateable,
} from "kysely";

// Enum types
export type UserKind = "Parent" | "Driver" | "Admin" | "School";
export type AuthProvidersEnum = "email";
export type NotificationKind = "Personal" | "System";
export type NotificationSection =
  | "Profile"
  | "Rides"
  | "Vehicle"
  | "Payments"
  | "Other";
export type PaymentKind = "Bank" | "M-Pesa";
export type TransactionType = "Deposit" | "Withdrawal";
export type DailyRideKind = "Pickup" | "Dropoff";
export type DailyRideStatus = "Active" | "Inactive" | "Started" | "Finished";
export type RideStatus =
  | "Requested"
  | "Cancelled"
  | "Ongoing"
  | "Pending"
  | "Completed";
export type Gender = "Female" | "Male";
export type VehicleStatus = "Active" | "Inactive";
export type VehicleType = "Bus" | "Van" | "Car";
export type RideType = "dropoff" | "pickup" | "pickup & dropoff";

// Meta types
export type UserMeta = {
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
};

export type DailyRideMeta = JSONColumnType<{
  notifications: {
    point_five_km: boolean;
    one_km: boolean;
  };
}> | null;
export type RideSchedule = JSONColumnType<{
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
export type SchoolMeta = JSONColumnType<{
  administrator_name: string | null;
  administrator_phone: string | null;
  administrator_email: string | null;
  official_email: string | null;
  logo: string | null;
  longitude: number;
  latitude: number;
}> | null;

// Table interfaces
export interface UserTable {
  id: Generated<number>;
  email: string | null;
  password: string | null;
  provider: string;
  socialId: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  phone_number: string | null;
  kind: UserKind | null;
  meta: UserMeta | null;
  wallet_balance: number;
  is_kyc_verified: boolean;
  photo: string | null; // Foreign key to files table
  roleId: number | null; // Foreign key to role table
  statusId: number | null; // Foreign key to status table
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
  school_id: number | null; // Foreign key to school table
}

export interface KycTable {
  id: Generated<number>;
  national_id_front: string | null;
  national_id_back: string | null;
  passport_photo: string | null;
  driving_license: string | null;
  certificate_of_good_conduct: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  comments: string | null;
  is_verified: boolean;
  userId: number | null; // Foreign key to user table
}

export interface LocationTable {
  id: Generated<number>;
  daily_rideId: number; // Foreign key to daily_ride table
  driverId: number; // Foreign key to user table
  latitude: number;
  longitude: number;
  timestamp: Date;
  created_at: Generated<Date>;
}

export interface NotificationTable {
  id: Generated<number>;
  userId: number; // Foreign key to user table
  title: string;
  message: string;
  meta: any | null;
  is_read: boolean;
  kind: NotificationKind;
  section: NotificationSection;
  created_at: Generated<Date>;
}

export interface PaymentTable {
  id: Generated<number>;
  userId: number; // Foreign key to user table
  amount: number;
  kind: PaymentKind;
  transaction_type: TransactionType;
  comments: string | null;
  transaction_id: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface DailyRideTable {
  id: Generated<number>;
  rideId: number; // Foreign key to ride table
  vehicleId: number; // Foreign key to vehicle table
  driverId: number | null; // Foreign key to user table
  kind: DailyRideKind;
  date: Date;
  start_time: Date | null;
  end_time: Date | null;
  comments: string | null;
  meta: DailyRideMeta | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  status: DailyRideStatus;
}

export interface RideTable {
  id: Generated<number>;
  vehicleId: number | null; // Foreign key to vehicle table
  driverId: number | null; // Foreign key to user table
  schoolId: number | null; // Foreign key to school table
  studentId: number | null; // Foreign key to student table
  parentId: number | null; // Foreign key to user table
  schedule: RideSchedule | null;
  comments: string | null;
  admin_comments: string | null;
  meta: any | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  status: RideStatus;
}

export interface RoleTable {
  id: number; // Primary key, not generated
  name: string | null;
}

export interface SchoolTable {
  id: Generated<number>;
  name: string;
  location: string | null;
  comments: string | null;
  url: string | null;
  meta: SchoolMeta | null;
  created_at: Generated<Date>;
}

export interface StatusTable {
  id: number; // Primary key, not generated
  name: string | null;
}

export interface SessionTable {
  id: Generated<number>;
  userId: number; // Foreign key to user table
  hash: string;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
  deletedAt: Date | null;
}

export interface StudentTable {
  id: Generated<number>;
  schoolId: number | null; // Foreign key to school table
  parentId: number | null; // Foreign key to user table
  name: string;
  profile_picture: string | null;
  gender: Gender;
  address: string | null;
  comments: string | null;
  meta: any | null;
  created_at: Generated<Date>;
}

export interface VehicleTable {
  id: Generated<number>;
  userId: number | null; // Foreign key to user table
  vehicle_name: string | null;
  registration_number: string;
  vehicle_type: VehicleType;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_image_url: string | null;
  seat_count: number;
  available_seats: number;
  is_inspected: boolean;
  comments: string | null;
  meta: any | null;
  vehicle_registration: string | null;
  insurance_certificate: string | null;
  vehicle_data: any | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  status: VehicleStatus;
}

export interface FileTable {
  id: Generated<number>;
  path: string;
  // Add file table properties based on your FileEntity
  // This is referenced by UserTable.photoId
}

export interface OnboardingFormTable {
  id: Generated<number>;
  parent_name: string;
  parent_email: string | null;
  parent_phone: string | null;
  address: string | null;
  student_name: string;
  student_gender: Gender;
  schoolId: number; // Foreign key to school table
  ride_type: RideType;
  pickup: string | null;
  dropoff: string | null;
  start_date: Date | null;
  mid_term: Date | null;
  end_date: Date | null;
  created_at: Generated<Date>;
}

// Database interface
export interface Database {
  user: UserTable;
  kyc: KycTable;
  location: LocationTable;
  notification: NotificationTable;
  payment: PaymentTable;
  daily_ride: DailyRideTable;
  ride: RideTable;
  role: RoleTable;
  school: SchoolTable;
  status: StatusTable;
  session: SessionTable;
  student: StudentTable;
  vehicle: VehicleTable;
  file: FileTable;
  onboarding_form: OnboardingFormTable;
}

// Helper types for insert, select, and update operations
export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export type Kyc = Selectable<KycTable>;
export type NewKyc = Insertable<KycTable>;
export type KycUpdate = Updateable<KycTable>;

export type Location = Selectable<LocationTable>;
export type NewLocation = Insertable<LocationTable>;
export type LocationUpdate = Updateable<LocationTable>;

export type Notification = Selectable<NotificationTable>;
export type NewNotification = Insertable<NotificationTable>;
export type NotificationUpdate = Updateable<NotificationTable>;

export type Payment = Selectable<PaymentTable>;
export type NewPayment = Insertable<PaymentTable>;
export type PaymentUpdate = Updateable<PaymentTable>;

export type DailyRide = Selectable<DailyRideTable>;
export type NewDailyRide = Insertable<DailyRideTable>;
export type DailyRideUpdate = Updateable<DailyRideTable>;

export type Ride = Selectable<RideTable>;
export type NewRide = Insertable<RideTable>;
export type RideUpdate = Updateable<RideTable>;

export type Role = Selectable<RoleTable>;
export type NewRole = Insertable<RoleTable>;
export type RoleUpdate = Updateable<RoleTable>;

export type School = Selectable<SchoolTable>;
export type NewSchool = Insertable<SchoolTable>;
export type SchoolUpdate = Updateable<SchoolTable>;

export type Status = Selectable<StatusTable>;
export type NewStatus = Insertable<StatusTable>;
export type StatusUpdate = Updateable<StatusTable>;

export type Session = Selectable<SessionTable>;
export type NewSession = Insertable<SessionTable>;
export type SessionUpdate = Updateable<SessionTable>;

export type Student = Selectable<StudentTable>;
export type NewStudent = Insertable<StudentTable>;
export type StudentUpdate = Updateable<StudentTable>;

export type Vehicle = Selectable<VehicleTable>;
export type NewVehicle = Insertable<VehicleTable>;
export type VehicleUpdate = Updateable<VehicleTable>;
