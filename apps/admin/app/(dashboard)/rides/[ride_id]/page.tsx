import { Breadcrumbs } from "@/components/breadcrumbs";
import { db } from "@repo/database";
import { RideDetailsPage } from "./dets";
import { Mapping } from "@repo/handlers/mapping";
export default async function Page({ params }: { params: any }) {
  const { ride_id } = await params;
  let ride = await db
    .selectFrom("ride")
    .selectAll()
    .where("id", "=", ride_id)
    .executeTakeFirst();
  if (!ride) {
    return <div>Ride not found</div>;
  }
  let student = await db
    .selectFrom("student")
    .selectAll()
    .where("id", "=", ride.student_id)
    .executeTakeFirst();
  let vehicle = await db
    .selectFrom("vehicle")
    .selectAll()
    .where("id", "=", ride.vehicle_id)
    .executeTakeFirst();
  let driver = await db
    .selectFrom("user")
    .selectAll()
    .where("id", "=", ride.driver_id)
    .executeTakeFirst();
  let guardian = await db
    .selectFrom("user")
    .selectAll()
    .where("id", "=", ride.parent_id)
    .executeTakeFirst();
  let tripHistory = await db
    .selectFrom("daily_ride")
    .leftJoin("ride", "ride.id", "daily_ride.ride_id")
    .leftJoin("student", "student.id", "ride.student_id")
    .select([
      "daily_ride.id",
      "daily_ride.status",
      "student.name as passenger",
      "daily_ride.start_time",
      "daily_ride.end_time",
      "daily_ride.kind",
    ])
    .where("daily_ride.ride_id", "=", ride.id)
    .where("daily_ride.status", "!=", "Inactive")
    .orderBy("daily_ride.date", "desc")
    .execute();
  // let mapping = new Mapping();
  // let route = await mapping.getRoute({
  //   origin: {
  //     latitude: ride.schedule?.pickup.latitude!,
  //     longitude: ride.schedule?.pickup.longitude!,
  //   },
  //   destination: {
  //     latitude: ride.schedule?.dropoff.latitude!,
  //     longitude: ride.schedule?.dropoff.longitude!,
  //   },
  // });
  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "/rides",
            label: "Rides",
          },
          {
            href: `/rides/${ride_id}`,
            label: "Ride Details",
          },
        ]}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ride Details</h1>
        </div>
      </div>
      <RideDetailsPage
        details={ride}
        student={student}
        vehicle={vehicle}
        driver={driver}
        guardian={guardian}
        tripHistory={tripHistory}
        // route={route}
      />
    </div>
  );
}
