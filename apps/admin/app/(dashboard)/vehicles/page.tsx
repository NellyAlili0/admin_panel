import { Breadcrumbs } from "@/components/breadcrumbs";
import { database } from "@/database/config";
import GenTable from "@/components/tables";
import SearchBar from "./search-bar"; // 👈 add this file

// Define interface for vehicle data
interface Vehicle {
  Car: string | null;
  Plate: string | null;
  Type: string | null;
  Model: string | null;
  Available_Seats: number | null;
  status: string | null;
  Driver: string | null;
}

export default async function Page() {
  // Fetch vehicles with driver info
  const vehicles = await database
    .selectFrom("vehicle")
    .leftJoin("user", "vehicle.userId", "user.id")
    .select([
      "vehicle.vehicle_name as Car",
      "vehicle.registration_number as Plate",
      "vehicle.vehicle_type as Type",
      "vehicle.vehicle_model as Model",
      "vehicle.available_seats as Available_Seats",
      "vehicle.status",
      "user.name as Driver",
    ])
    .execute();

  if (!vehicles) {
    return <div>Error fetching vehicles</div>;
  }

  const formattedVehicles = vehicles.map((vehicle) => ({
    ...vehicle,
    Car: vehicle.Car ?? "Not specified",
    Plate: vehicle.Plate ?? "Not specified",
    Type: vehicle.Type ?? "Unknown",
    Model: vehicle.Model ?? "Unknown",
    Available_Seats: vehicle.Available_Seats ?? 0,
    status: vehicle.status ?? "Unknown",
    Driver: vehicle.Driver ?? "Unassigned",
  }));

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs items={[{ href: "/vehicles", label: "Vehicles" }]} />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vehicles</h1>
        <p className="text-muted-foreground my-2">
          Total of {formattedVehicles.length} vehicles
        </p>
      </div>

      {/* 🔍 Search + Table */}
      <SearchBar data={formattedVehicles} />
    </div>
  );
}
