import { Breadcrumbs } from "@/components/breadcrumbs";
import { db } from "@repo/database";
import GenTable from "@/components/tables";

export default async function Page() {
    const vehicles = await db.selectFrom('vehicle')
    .leftJoin('user', 'vehicle.user_id', 'user.id')
    .select([
        'vehicle.vehicle_name as Car',
        'vehicle.registration_number as Plate',
        'vehicle.vehicle_type as Type',
        'vehicle.vehicle_model as Model',
        'vehicle.available_seats as Available Seats',
        'vehicle.status',
        'user.name as Driver',
    ]).execute();
  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "/vehicles",
            label: "Vehicles",
          },
        ]}
      />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vehicles</h1>
        <p className="text-muted-foreground"> Total of {vehicles.length} vehicles </p>
      </div>
      <GenTable title="All Vehicles" cols={[
        'Driver',
        'Car',
        'Plate',
        'Type',
        'Model',
        'Available Seats',
        'status',
      ]} data={vehicles} baseLink="/vehicles/" uniqueKey="Plate" />
    </div>
  );
}
