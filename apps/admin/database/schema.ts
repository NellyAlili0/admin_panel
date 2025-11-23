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
export type DailyRideStatus = "Ongoing" | "Inactive" | "Started" | "Finished";
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
export type PaymentModel = "daily" | "term" | "zidallie";
export type PaymentType =
  | "initial"
  | "installment"
  | "daily"
  | "weekly"
  | "monthly"
  | "termly";
export type DisbursementType = "B2C" | "B2B";
export type DisbursementStatus = "pending" | "completed" | "failed";
export type ServiceType = "school" | "carpool" | "private";

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
  photo: string | null;
  roleId: number | null;
  statusId: number | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
  school_id: number | null;
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
  userId: number | null;
}

export interface LocationTable {
  id: Generated<number>;
  daily_rideId: number;
  driverId: number;
  latitude: number;
  longitude: number;
  timestamp: Date;
  created_at: Generated<Date>;
}

export interface NotificationTable {
  id: Generated<number>;
  userId: number;
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
  userId: number;
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
  rideId: number;
  vehicleId: number;
  driverId: number | null;
  kind: DailyRideKind;
  date: Date;
  start_time: Date | null;
  end_time: Date | null;
  comments: string | null;
  meta: DailyRideMeta | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  embark_time: Date | null;
  disembark_time: Date | null;
  status: DailyRideStatus;
}

export interface RideTable {
  id: Generated<number>;
  vehicleId: number | null;
  driverId: number | null;
  schoolId: number | null;
  studentId: number | null;
  parentId: number | null;
  schedule: RideSchedule | null;
  comments: string | null;
  admin_comments: string | null;
  meta: any | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  status: RideStatus;
}

export interface RoleTable {
  id: number;
  name: string | null;
}

export interface SchoolTable {
  id: Generated<number>;
  name: string;
  location: string | null;
  disbursement_phone_number: string | null;
  bank_paybill_number: string | null;
  bank_account_number: string | null;
  comments: string | null;
  url: string | null;
  smart_card_url: string | null;
  terra_email: string | null;
  terra_password: string | null;
  terra_tag_id: string | null;
  terra_zone_tag: string | null;
  terra_parents_tag: string | null;
  terra_student_tag: string | null;
  terra_school_tag: string | null;
  meta: SchoolMeta | null;
  has_commission: boolean;
  commission_amount: number | null;
  paybill: string | null;
  service_type: ServiceType | null;
  created_at: Generated<Date>;
}

export interface StatusTable {
  id: number;
  name: string | null;
}

export interface SessionTable {
  id: Generated<number>;
  userId: number;
  hash: string;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
  deletedAt: Date | null;
}

export interface StudentTable {
  id: Generated<number>;
  schoolId: number | null;
  parentId: number | null;
  name: string;
  profile_picture: string | null;
  gender: Gender;
  address: string | null;
  comments: string | null;
  meta: any | null;
  account_number: string | null;
  daily_fee: number | null;
  transport_term_fee: number | null;
  service_type: ServiceType | null;
  created_at: Generated<Date>;
}

export interface VehicleTable {
  id: Generated<number>;
  userId: number | null;
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
}

export interface OnboardingFormTable {
  id: Generated<number>;
  parent_name: string;
  parent_email: string | null;
  parent_phone: string | null;
  address: string | null;
  student_name: string;
  student_gender: Gender;
  schoolId: number;
  ride_type: RideType;
  pickup: string | null;
  dropoff: string | null;
  start_date: Date | null;
  mid_term: Date | null;
  end_date: Date | null;
  created_at: Generated<Date>;
}

export interface B2cMpesaTransactionTable {
  id: Generated<number>;
  transaction_id: string | null;
  conversation_id: string | null;
  originator_conversation_id: string | null;
  result_type: number | null;
  result_code: number | null;
  result_desc: string | null;
  transaction_amount: number | null;
  receiver_party_public_name: string | null;
  transaction_completed_at: Date | null;
  raw_result: JSONColumnType<Record<string, any>> | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface PaymentTermTable {
  id: Generated<number>;
  schoolId: number | null;
  name: string;
  start_date: Date;
  end_date: Date;
  is_active: boolean;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface PendingPaymentTable {
  id: Generated<number>;
  studentId: number | null;
  termId: number | null;
  subscriptionPlanId: number | null;
  amount: number;
  checkoutId: string | null;
  phoneNumber: string | null;
  paymentType: PaymentType | null;
  paymentModel: PaymentModel | null;
  schoolId: number | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface SchoolDisbursementTable {
  id: Generated<number>;
  studentId: number;
  termId: number | null;
  paymentId: number;
  bank_paybill: string | null;
  account_number: string | null;
  amount_disbursed: number;
  disbursement_type: DisbursementType;
  transaction_id: string | null;
  status: DisbursementStatus;
  created_at: Generated<Date>;
}

export interface StudentPaymentTable {
  id: Generated<number>;
  studentId: number;
  termId: number | null;
  transaction_id: string;
  phone_number: string;
  amount_paid: number;
  payment_type: PaymentType;
  created_at: Generated<Date>;
}

export interface SubscriptionPlanTable {
  id: Generated<number>;
  school_id: number;
  name: string;
  description: string | null;
  duration_days: number;
  price: number;
  commission_amount: number;
  is_active: boolean;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface SubscriptionTable {
  id: Generated<number>;
  student_id: number;
  plan_id: number | null;
  term_id: number | null;
  start_date: Date;
  expiry_date: Date;
  amount: number | null;
  status: string;
  total_paid: number;
  balance: number;
  is_commission_paid: boolean;
  days_access: number | null;
  last_payment_date: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface TermCommissionTable {
  id: Generated<number>;
  studentId: number;
  termId: number;
  commission_amount: number;
  is_paid: boolean;
  paid_at: Date | null;
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
  b2cmpesa_transactions: B2cMpesaTransactionTable;
  payment_terms: PaymentTermTable;
  pending_payments: PendingPaymentTable;
  school_disbursements: SchoolDisbursementTable;
  student_payments: StudentPaymentTable;
  subscription_plans: SubscriptionPlanTable;
  subscriptions: SubscriptionTable;
  term_commissions: TermCommissionTable;
}

// Helper types for existing tables
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

// Helper types for new tables
export type B2cMpesaTransaction = Selectable<B2cMpesaTransactionTable>;
export type NewB2cMpesaTransaction = Insertable<B2cMpesaTransactionTable>;
export type B2cMpesaTransactionUpdate = Updateable<B2cMpesaTransactionTable>;

export type PaymentTerm = Selectable<PaymentTermTable>;
export type NewPaymentTerm = Insertable<PaymentTermTable>;
export type PaymentTermUpdate = Updateable<PaymentTermTable>;

export type PendingPayment = Selectable<PendingPaymentTable>;
export type NewPendingPayment = Insertable<PendingPaymentTable>;
export type PendingPaymentUpdate = Updateable<PendingPaymentTable>;

export type SchoolDisbursement = Selectable<SchoolDisbursementTable>;
export type NewSchoolDisbursement = Insertable<SchoolDisbursementTable>;
export type SchoolDisbursementUpdate = Updateable<SchoolDisbursementTable>;

export type StudentPayment = Selectable<StudentPaymentTable>;
export type NewStudentPayment = Insertable<StudentPaymentTable>;
export type StudentPaymentUpdate = Updateable<StudentPaymentTable>;

export type SubscriptionPlan = Selectable<SubscriptionPlanTable>;
export type NewSubscriptionPlan = Insertable<SubscriptionPlanTable>;
export type SubscriptionPlanUpdate = Updateable<SubscriptionPlanTable>;

export type Subscription = Selectable<SubscriptionTable>;
export type NewSubscription = Insertable<SubscriptionTable>;
export type SubscriptionUpdate = Updateable<SubscriptionTable>;

export type TermCommission = Selectable<TermCommissionTable>;
export type NewTermCommission = Insertable<TermCommissionTable>;
export type TermCommissionUpdate = Updateable<TermCommissionTable>;
