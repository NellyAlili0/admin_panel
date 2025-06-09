import { db } from "@repo/database";

export async function GET(req: Request) {
    let drivers = await db
        .selectFrom("daily_ride")
        .leftJoin("user", "daily_ride.driver_id", "user.id")
        .leftJoin("vehicle", "user.id", "vehicle.user_id")
        .select([
            "user.email",
            "user.phone_number",
            "user.name",
            "vehicle.vehicle_name as vehicle_name",
            "vehicle.registration_number",
        ])
        .distinctOn("user.email")
        .where((eb) => eb.or([eb("daily_ride.status", "=", "Started")]))
        .execute();

    // last locations of driver, passenger count
    let allDriverInfo: any = [];
    for (let driver of drivers) {
        let lastLocation = await db
            .selectFrom("location")
            .leftJoin("daily_ride", "location.daily_ride_id", "daily_ride.id")
            .leftJoin("user", "daily_ride.driver_id", "user.id")
            .select(["latitude", "longitude"])
            .where("user.email", "=", driver.email)
            .executeTakeFirst();
        // convert last location to integer or double
        if (lastLocation) {
            lastLocation.latitude = Number(lastLocation.latitude);
            lastLocation.longitude = Number(lastLocation.longitude);
        }
        else {
            lastLocation = {
                latitude: 0,
                longitude: 0,
            };
        }
        const { count } = await db
            .selectFrom("daily_ride")
            .leftJoin("user", "daily_ride.driver_id", "user.id")
            .select(db.fn.countAll().as("count"))
            .where("user.email", "=", driver.email)
            .executeTakeFirstOrThrow();

        allDriverInfo.push({
            ...driver,
            lastLocation: lastLocation || { latitude: 0, longitude: 0 },
            passengerCount: count,
        });
    }
    return Response.json(allDriverInfo);
}