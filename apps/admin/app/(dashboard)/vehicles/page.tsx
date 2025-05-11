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
        'vehicle.vehicle_year as Year',
        'vehicle.available_seats as Available Seats',
        'vehicle.is_inspected as Inspected',
        'vehicle.created_at',
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
        <p className="text-muted-foreground"> Total of {0} vehicles </p>
      </div>
      <GenTable title="All Vehicles" cols={[
        'Driver',
        'Car',
        'Plate',
        'Type',
        'Model',
        'Year',
        'Available Seats',
        'Inspected',
        'created_at',
        'status',
      ]} data={vehicles} baseLink="/vehicles/" uniqueKey="registration_number" />
    </div>
  );
}
