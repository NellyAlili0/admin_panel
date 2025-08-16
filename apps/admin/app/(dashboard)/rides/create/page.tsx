import { Breadcrumbs } from "@/components/breadcrumbs";
import AssignRidePage from "./dets";
import { database } from "@/database/config";

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

export default async function Page() {
  // All drivers
  const allDriversRaw = await database
    .selectFrom("user")
    .leftJoin("vehicle", "user.id", "vehicle.userId")
    .select([
      "user.id as driver_id",
      "user.name",
      "user.email",
      "user.phone_number",
      "vehicle.id as vehicle_id",
      "vehicle.vehicle_name",
      "vehicle.registration_number",
      "vehicle.seat_count",
      "vehicle.available_seats",
      "vehicle.vehicle_type", // ✅ Include this
    ])
    .where("user.kind", "=", "Driver")
    .where("vehicle.is_inspected", "=", true)
    .where("user.is_kyc_verified", "=", true)
    .execute();

  const allDrivers: Driver[] = allDriversRaw.map((d) => ({
    id: d.driver_id, // ✅ Rename to match interface
    name: d.name,
    email: d.email,
    phone_number: d.phone_number,
    vehicle_id: d.vehicle_id!,
    vehicle_name: d.vehicle_name,
    registration_number: d.registration_number!,
    vehicle_type: d.vehicle_type!, // ✅ Required field
    seat_count: d.seat_count!,
    available_seats: d.available_seats!,
  }));

  let allStudentsRaw = await database
    .selectFrom("student")
    .leftJoin("user", "student.parentId", "user.id")
    .leftJoin("school", "student.schoolId", "school.id")
    .leftJoin("ride", "student.id", "ride.studentId")
    .select([
      "student.id as student_id",
      "student.name as student_name",
      "student.gender",
      "student.address",
      "student.schoolId as school_id",
      "school.name as school_name",
      "user.id as parent_id",
      "user.name as parent_name",
      "user.email as parent_email",
      "user.phone_number as parent_phone",
    ])
    .where("user.kind", "=", "Parent")
    .where("ride.id", "is", null)
    .execute();

  const allStudents: Student[] = allStudentsRaw.map((s) => ({
    id: s.student_id,
    name: s.student_name,
    gender: s.gender!,
    address: s.address,
    school_id: s.school_id,
    school_name: s.school_name ?? null,
    parent_id: s.parent_id,
    parent_name: s.parent_name,
    parent_email: s.parent_email,
    parent_phone: s.parent_phone,
  }));

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "/rides",
            label: "Rides",
          },
          {
            href: "/rides/create",
            label: "Create Ride",
          },
        ]}
      />
      <AssignRidePage drivers={allDrivers} students={allStudents} />
    </div>
  );
}
