import { Breadcrumbs } from "@/components/breadcrumbs";
import BulkRideCreator from "./bulk-ride-creator";
import { database } from "@/database/config";
import { assignRide } from "./action";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Driver {
  id: number;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  vehicle_id: number;
  vehicle_name: string | null;
  registration_number: string;
  vehicle_type: "Bus" | "Van" | "Car";
  seat_count: number;
  available_seats: number;
  avatar?: string;
}

interface Student {
  id: number;
  name: string;
  gender: "Female" | "Male";
  address: string | null;
  parent_id: number | null;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  school_id: number | null;
  school_name?: string | null;
  avatar?: string;
}

export default async function Page() {
  // Fetch all verified drivers with their vehicles
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
      "vehicle.vehicle_type",
    ])
    .where("user.kind", "=", "Driver")
    .where("vehicle.is_inspected", "=", true)
    .where("user.is_kyc_verified", "=", true)
    .where("vehicle.status", "=", "Active")
    .execute();

  const allDrivers: Driver[] = allDriversRaw
    .filter((d) => d.vehicle_id) // Only include drivers with vehicles
    .map((d) => ({
      id: d.driver_id,
      name: d.name,
      email: d.email,
      phone_number: d.phone_number,
      vehicle_id: d.vehicle_id!,
      vehicle_name: d.vehicle_name,
      registration_number: d.registration_number!,
      vehicle_type: d.vehicle_type!,
      seat_count: d.seat_count!,
      available_seats: d.available_seats!,
    }));

  // Fetch all students without existing rides
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
    .where("ride.id", "is", null) // Only students without existing rides
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

      <div className="py-6 px-4 max-w-7xl">
        <h1 className="text-3xl font-bold mt-5 mb-8">Create Rides in Bulk</h1>

        <BulkRideCreator
          drivers={allDrivers}
          students={allStudents}
          assignRide={assignRide}
        />
      </div>
    </div>
  );
}
