import { Breadcrumbs } from "@/components/breadcrumbs";
import { database } from "@/database/config";
import { RideDetailsPage } from "./dets";
import { Mapping } from "@repo/handlers/mapping";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ride_id = Number(id);

  let ride = await database
    .selectFrom("ride")
    .selectAll()
    .where("id", "=", ride_id)
    .executeTakeFirst();

  if (!ride) {
    return <div>Ride not found</div>;
  }

  let student = await database
    .selectFrom("student")
    .selectAll()
    .where("id", "=", ride.studentId)
    .executeTakeFirst();

  let vehicle = await database
    .selectFrom("vehicle")
    .selectAll()
    .where("id", "=", ride.vehicleId)
    .executeTakeFirst();

  let driver = await database
    .selectFrom("user")
    .selectAll()
    .where("id", "=", ride.driverId)
    .executeTakeFirst();

  let guardian = await database
    .selectFrom("user")
    .selectAll()
    .where("id", "=", ride.parentId)
    .executeTakeFirst();

  let tripHistory = await database
    .selectFrom("daily_ride")
    .leftJoin("ride", "ride.id", "daily_ride.rideId")
    .leftJoin("student", "student.id", "ride.studentId")
    .select([
      "daily_ride.id",
      "daily_ride.status",
      "student.name as passenger",
      "daily_ride.start_time",
      "daily_ride.end_time",
      "daily_ride.kind",
    ])
    .where("daily_ride.rideId", "=", ride.id)
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
function use(params: Promise<{ id: any }>): { ride_id: any } {
  throw new Error("Function not implemented.");
}
