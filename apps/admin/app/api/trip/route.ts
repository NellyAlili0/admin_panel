// pages/api/stream-drivers.ts
import { db } from "@repo/database";

// mock drivers
let drivers = [
    {
        id: "1",
        name: "Test Driver",
        email: "driver1@gmail.com",
        phone_number: "08123456789",
        vehicle_id: "1",
        vehicle_name: "Vehicle 1",
        registration_number: "123456",
        seat_count: 5,
        available_seats: 2,
        // -1.2069029194436431, 36.785960208533695
        // -1.207353430545395, 36.78622842943143
        location: {
            lat: -1.2073534,
            lng: 36.7862284,
        }
    },
    {
        id: "2",
        name: "Test Driver",
        email: "driver2@gmail.com",
        phone_number: "08123456789",
        vehicle_id: "2",
        vehicle_name: "Vehicle 2",
        registration_number: "123456",
        seat_count: 5,
        available_seats: 2,
        // -1.2069029194436431, 36.785960208533695
        // -1.207353430545395, 36.78622842943143
        location: {
            lat: -1.2069029,
            lng: 36.785960,
        }
    },
    {
        id: "3",
        name: "Test Driver",
        email: "driver3@gmail.com",
        phone_number: "08123456789",
        vehicle_id: "3",
        vehicle_name: "Vehicle 3",
        registration_number: "123456",
        seat_count: 5,
        available_seats: 2,
        // -1.2069029194436431, 36.785960208533695
        // -1.207353430545395, 36.78622842943143
        // -1.2195203588980121, 36.801768909119026
        location: {
            lat: -1.2195203,
            lng: 36.8017689,
        }
    }
]


export async function GET(req: Request) {
    let res = new Response()
    res.headers.set('Content-Type', 'text/event-stream')
    res.headers.set('Cache-Control', 'no-cache, no-transform')
    res.headers.set('Connection', 'keep-alive')
    // create random number of three digits
    let random = Math.floor(Math.random() * 900) + 100;
    return Response.json(drivers)
//   // Send initial message
//   sendData(res, { message: 'Connected to driver stream' });

  // Set up polling interval (every 5 seconds)
  const interval = setInterval(async () => {
    try {
      // Query your database for driver data
    //   const drivers = await db.selectFrom('user')
    //     .leftJoin('vehicle', 'user.id', 'vehicle.user_id')
    //     .select([
    //         'user.name',
    //         'user.email',
    //         'user.phone_number',
    //         'vehicle.id as vehicle_id',
    //         'vehicle.vehicle_name as vehicle_name',
    //         'vehicle.registration_number',
    //         'vehicle.seat_count',
    //         'vehicle.available_seats',
    //     ])
    //     .where('user.kind', '=', 'Driver')
    //     .where('vehicle.is_inspected', '=', true)
    //     .where('user.is_kyc_verified', '=', true)
    //     .execute();

        // create mock data here
        let responseSample = {
            id: "1",
            name: "Driver 1",
            email: "driver1@gmail.com",
            phone_number: "08123456789",
            vehicle_id: "1",
            vehicle_name: "Vehicle 1",
            registration_number: "123456",
            seat_count: 5,
            available_seats: 2,
            location: {
                lat: 4.9022,
                lng: 7.9022
            }
        }
      
      // Transform data to match our interface
    //   const drivers = rows.map(row => ({
    //     id: row.id,
    //     name: row.name,
    //     numberplate: row.numberplate,
    //     passengers: row.passengers,
    //       ST_X(location::geometry) as lng, 
    //       ST_Y(location::geometry) as lat 
    //     FROM drivers 
    //     WHERE active = true
    //   `);

      // Transform data to match our interface
    //   const drivers = rows.map(row => ({
    //     id: row.id,
    //     name: row.name,
    //     numberplate: row.numberplate,
    //     passengers: row.passengers,
    //     location: {
    //       lat: parseFloat(row.lat),
    //       lng: parseFloat(row.lng)
    //     }
    //   }));

      // Send data to client
      return Response.json(responseSample)
    //   return sendData(res, responseSample);
    } catch (error) {
      console.error('Database query error:', error);
      return Response.json({ error: 'Failed to fetch driver data' })
    }
  }, 5000);

  // Clean up on connection close
//   res.on('close', () => {
//     clearInterval(interval);
//     res.close();
//   });
}

function sendData(res: Response, data: any) {
    return Response.json(data)
}