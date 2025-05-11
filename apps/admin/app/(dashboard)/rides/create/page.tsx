import { Breadcrumbs } from "@/components/breadcrumbs";
import { AssignRidePage } from "./details";
import { db } from "@repo/database";

export default async function Page() {
    // all drivers
    let allDrivers = await db.selectFrom('user')
        .leftJoin('vehicle', 'user.id', 'vehicle.user_id')
        .select([
            'user.name',
            'user.email',
            'user.phone_number',
            'vehicle.id as vehicle_id',
            'vehicle.vehicle_name as vehicle_name',
            'vehicle.registration_number',
            'vehicle.seat_count',
            'vehicle.available_seats',
        ])
        .where('user.kind', '=', 'Driver')
        .where('vehicle.is_inspected', '=', true)
        .where('user.is_kyc_verified', '=', true)
        .execute();
    // all students and parents with no ongoing rides
    let allStudents = await db.selectFrom('student')
        .leftJoin('user', 'student.parent_id', 'user.id')
        .leftJoin('ride', 'student.id', 'ride.student_id')
        .select([
            'user.id as parent_id',
            'user.name as parent_name',
            'user.email as parent_email',
            'user.phone_number as parent_phone',
            'user.created_at as parent_created_at',
            'student.id as student_id',
            'student.name as student_name',
        ])
        .where('user.kind', '=', 'Parent')
        .where('ride.id', 'is', null)
        .execute();
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
