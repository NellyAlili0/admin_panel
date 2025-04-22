import {
    ColumnType,
    Generated,
    JSONColumnType,
} from 'kysely'

import { sql } from 'kysely'

export interface Database {
    user: UserTable
    kyc: KYCTable
    admin: AdminTable
    school: SchoolTable
    student: StudentTable
    route: RouteTable
    vehicle: VehicleTable
    ride: RideTable
    skip_day: SkipDayTable
    daily_ride: DailyRideTable
    location: LocationTable
    payment: PaymentTable
    maintenance: MaintenanceTable
    fuel: FuelTable
    notification: NotificationTable
}

export interface UserTable {
    id: Generated<number>
    first_name: string
    last_name: string
    email: string | null
    password: string
    phone_number: string | null
    kind: 'Parent' | 'Driver' | 'School' | 'Fleet Manager'
    meta: JSONColumnType<{}> | null
    created_at: ColumnType<Date, string | undefined, never>
    updated_at: ColumnType<Date, string | undefined, never>
    status: 'Active' | 'Inactive'
}

export interface KYCTable {
    id: Generated<number>
    user_id: number
    national_id_front: string | null
    passport_photo: string | null
    driving_license: string | null
    vehicle_registration: string | null
    insurance_certificate: string | null
    certificate_of_good_conduct: string | null
    vehicle_data: JSONColumnType<{}> | null
    created_at: ColumnType<Date, string | undefined, never>
    updated_at: ColumnType<Date, string | undefined, never>
    comments: string | null
    is_verified: boolean
    status: 'Active' | 'Inactive'
}

export interface AdminTable {
    id: Generated<number>
    name: string
    email: string | null
    password: string
    role: 'Finance' | 'Admin' | 'Operations'
    created_at: ColumnType<Date, string | undefined, never>
    status: 'Active' | 'Inactive'
}

export interface SchoolTable {
    id: Generated<number>
    user_id: number
    name: string
    location: string | null
    comments: string | null
    meta: JSONColumnType<{}> | null // administrator contacts, official email, logo and more
    created_at: ColumnType<Date, string | undefined, never>
    status: 'Active' | 'Inactive'
}

export interface StudentTable {
    id: Generated<number>
    school_id: number | null
    parent_id: number | null
    name: string
    gender: 'Male' | 'Female'
    address: string | null
    comments: string | null
    meta: JSONColumnType<{}> | null
    created_at: ColumnType<Date, string | undefined, never>
    status: 'Active' | 'Inactive'
}

export interface RouteTable {
    id: Generated<number>
    admin_id: number
    route_name: string
    comments: string | null
    route: JSONColumnType<{}> | null
    schedule: JSONColumnType<{}> | null
    created_at: ColumnType<Date, string | undefined, never>
    status: 'Active' | 'Inactive'
}

export interface VehicleTable {
    id: Generated<number>
    user_id: number | null
    fleet_manager_id: number | null
    vehicle_name: string | null
    registration_number: string
    vehicle_type: 'Bus' | 'Van' | 'Car'
    vehicle_model: string
    vehicle_year: number
    vehicle_image_url: string | null
    seat_count: number
    available_seats: number
    is_inspected: boolean
    comments: string | null
    meta: JSONColumnType<{}> | null
    created_at: ColumnType<Date, string | undefined, never>
    updated_at: ColumnType<Date, string | undefined, never>
    status: 'Active' | 'Inactive'
}

export interface RideTable {
    id: Generated<number>
    route_id: number | null
    vehicle_id: number | null
    driver_id: number | null
    school_id: number | null
    student_id: number | null
    parent_id: number | null
    schedule: JSONColumnType<{}> | null
    comments: string | null
    admin_comments: string | null
    meta: JSONColumnType<{}> | null
    created_at: ColumnType<Date, string | undefined, never>
    updated_at: ColumnType<Date, string | undefined, never>
    status: 'Active' | 'Inactive' | 'Pending' | 'Finished'
}

export interface SkipDayTable {
    id: Generated<number>
    ride_id: number
    date: ColumnType<Date, string | undefined, never>
    student_id: number | null
    school_id: number | null
    parent_id: number | null
    meta: JSONColumnType<{}> | null
    created_at: ColumnType<Date, string | undefined, never>
    updated_at: ColumnType<Date, string | undefined, never>
    status: 'Active' | 'Inactive'
}

export interface DailyRideTable {
    id: Generated<number>
    ride_id: number
    vehicle_id: number
    driver_id: number | null
    start_time: ColumnType<Date, string | undefined, never>
    end_time: ColumnType<Date, string | undefined, never>
    comments: string | null
    meta: JSONColumnType<{}> | null
    created_at: ColumnType<Date, string | undefined, never>
    updated_at: ColumnType<Date, string | undefined, never>
    status: 'Active' | 'Inactive' | 'Started' | 'Finished'
}

export interface LocationTable {
    id: Generated<number>
    daily_ride_id: number
    latitude: number
    longitude: number
    created_at: ColumnType<Date, string | undefined, never>
}

export interface PaymentTable {
    id: Generated<number>
    ride_id: number | null
    driver_id: number | null
    amount: number
    paybill_number: string | null
    payment_method: 'Cash' | 'Card' | 'Bank Transfer'
    payment_status: 'Paid' | 'Pending' | 'Failed'
    comments: string | null
    meta: JSONColumnType<{}> | null
    created_at: ColumnType<Date, string | undefined, never>
    updated_at: ColumnType<Date, string | undefined, never>
}

export interface MaintenanceTable {
    id: Generated<number>
    fleet_manager_id: number
    vehicle_id: number
    start_date: ColumnType<Date, string | undefined, never>
    description: string | null
    mechanic: string | null
    cost: number | null
    mileage: number | null
    next_maintenance: ColumnType<Date, string | undefined, never> | null
    meta: JSONColumnType<{}> | null // possible attachments
    created_at: ColumnType<Date, string | undefined, never>
    updated_at: ColumnType<Date, string | undefined, never>
    status: 'Active' | 'Inactive'
}

export interface FuelTable {
    id: Generated<number>
    fleet_manager_id: number
    vehicle_id: number
    quantity: number
    amount: number
    unit_cost: number
    location: string | null
    notes: string | null
    meta: JSONColumnType<{}> | null // possible attachments
    created_at: ColumnType<Date, string | undefined, never>
    updated_at: ColumnType<Date, string | undefined, never>
    status: 'Active' | 'Inactive'
}

export interface NotificationTable {
    id: Generated<number>
    user_id: number
    title: string
    message: string
    meta: JSONColumnType<{}> | null
    is_read: boolean
    kind: 'Personal' | 'System'
    section: 'Profile' | 'Vehicle' | 'Ride' | 'Maintenance' | 'Fuel' | 'Other'
    created_at: ColumnType<Date, string | undefined, never>
    updated_at: ColumnType<Date, string | undefined, never>
    status: 'Active' | 'Inactive'
}