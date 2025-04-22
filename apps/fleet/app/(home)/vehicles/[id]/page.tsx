import { authDetails } from "@/lib/auth";
import { db } from "@repo/database";

export default async function Page({ params }: { params }) {
    const { id } = await params;
    const auth = await authDetails()
    let user_id = 1 //auth?.user_id
    const vehicles = await db.selectFrom('vehicle')
        .leftJoin('daily_ride', 'vehicle.id', 'daily_ride.vehicle_id')
        .select(['vehicle.id', 'vehicle_name', 'registration_number', 'vehicle_type', 'seat_count', 'available_seats', 'daily_ride.status'])
        .where('fleet_manager_id', '=', user_id)
        .orderBy('vehicle_name', 'asc')
        .execute();
    // show ongoing trips, driver details, vehicle details, maintenance details, fuel details
    return (
        <div></div>
    );
}