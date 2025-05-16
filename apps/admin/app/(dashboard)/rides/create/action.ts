"use server"
import { zfd } from "zod-form-data"
import { db } from "@repo/database"
import { redirect } from "next/navigation"
import { Notify } from "@repo/handlers/notify"

const assignRideSchema = zfd.formData({
    driver_id: zfd.text(),
    student_id: zfd.text(),
    pickup_location: zfd.text(),
    pickup_time: zfd.text(),
    pickup_lat: zfd.text(),
    pickup_lng: zfd.text(),
    dropoff_location: zfd.text(),
    dropoff_time: zfd.text(),
    dropoff_lat: zfd.text(),
    dropoff_lng: zfd.text(),
    start_date: zfd.text(),
    end_date: zfd.text(),
    type: zfd.text(),
    cost: zfd.text(),
    comments: zfd.text(),
})


export async function assignRide(formData: FormData) {
    const data = assignRideSchema.safeParse(formData)
    if (!data.success) {
        return {
            message: "Invalid data"
        }
    }
    const { driver_id, student_id, pickup_location, pickup_time, pickup_lat, pickup_lng, dropoff_location, dropoff_time, dropoff_lat, dropoff_lng, start_date, end_date, type, cost, comments } = data.data;
    // get student info
    const student = await db.selectFrom('student')
        .select([
            'student.id',
            'student.name',
            'student.gender',
            'student.address',
            'student.comments',
            'student.parent_id',
        ])
        .where('student.id', '=', Number(student_id))
        .executeTakeFirst();
    // get parent info
    const parent = await db.selectFrom('user')
        .select([
            'user.id',
            'user.name',
            'user.email',
            'user.phone_number',
            'user.created_at',
        ])
        .where('user.id', '=', Number(student?.parent_id))
        .executeTakeFirst();
    // get driver info
    const driver = await db.selectFrom('user')
        .select([
            'user.id',
            'user.name',
            'user.email',
            'user.phone_number',
            'user.created_at',
        ])
        .where('user.id', '=', Number(driver_id))
        .executeTakeFirst();
    // get vehlce info
    const vehicle = await db.selectFrom('vehicle')
        .select([
            'vehicle.id',
            'vehicle.vehicle_name',
            'vehicle.registration_number',
            'vehicle.seat_count',
            'vehicle.available_seats',
        ])
        .where('vehicle.user_id', '=', Number(driver_id))
        .executeTakeFirst();
    // assign ride
    const weekdays = getWeekdaysBetweenDates(start_date, end_date);
    let ride = await db.insertInto('ride')
        .values({
            vehicle_id: Number(vehicle?.id),
            driver_id: Number(driver_id),
            student_id: Number(student_id),
            parent_id: Number(student?.parent_id),
            schedule: JSON.stringify({
                cost: Number(cost),
                pickup: {
                    start_time: pickup_time,
                    location: pickup_location,
                    latitude: Number(pickup_lat),
                    longitude: Number(pickup_lng),
                },
                dropoff: {
                    start_time: dropoff_time,
                    location: dropoff_location,
                    latitude: Number(dropoff_lat),
                    longitude: Number(dropoff_lng),
                },
                dates: weekdays,
                kind: type,
            }),
            comments,
            status: 'Ongoing',
        })
        .returning('id')
        .executeTakeFirst();
    // create daily ride for each weekday
    weekdays.forEach(async (weekday) => {
        // timestamps are in 12:13 format.
        // create a new date and add that time to it
        let pickupDate = new Date(weekday);
        pickupDate.setHours(Number(pickup_time.split(':')[0]));
        pickupDate.setMinutes(Number(pickup_time.split(':')[1]));
        let dropoffDate = new Date(weekday);
        dropoffDate.setHours(Number(dropoff_time.split(':')[0]));
        dropoffDate.setMinutes(Number(dropoff_time.split(':')[1]));
        let pick = await db.insertInto('daily_ride')
            .values([{
                ride_id: Number(ride?.id),
                vehicle_id: Number(vehicle?.id),
                driver_id: Number(driver_id),
                kind: 'Pickup',
                status: 'Inactive',
                date: new Date(weekday).toISOString().slice(0, 10),
                start_time: pickupDate.toISOString().slice(0, 19),
                end_time: dropoffDate.toISOString().slice(0, 19),
            }])
            .returningAll()
            .executeTakeFirst();
        let drop = await db.insertInto('daily_ride')
            .values([{
                ride_id: Number(ride?.id),
                vehicle_id: Number(vehicle?.id),
                driver_id: Number(driver_id),
                kind: 'Dropoff',
                status: 'Inactive',
                date: new Date(weekday).toISOString().slice(0, 10),
                start_time: dropoffDate.toISOString().slice(0, 19),
                end_time: dropoffDate.toISOString().slice(0, 19),
            }])
            .returningAll()
            .executeTakeFirst();
    })
    // send notification to driver and parent
    // const notify = new Notify();
    // await notify.sendSingle({
    //     title: "New Ride Assigned",
    //     message: `You have been assigned a new ride`,
    //     email: driver?.email!
    // });
    // await notify.sendSingle({
    //     title: "New Ride Assigned",
    //     message: `Your child has been assigned a new ride`,
    //     email: parent?.email!
    // });
    await db.updateTable('vehicle')
        .set({
            available_seats: vehicle?.available_seats! - 1
        })
        .where('id', '=', Number(vehicle?.id))
        .executeTakeFirst();
    await db.insertInto('notification')
        .values({
            user_id: Number(student?.parent_id),
            title: "New Ride Assigned",
            message: `Your child has been assigned a new ride`,
            is_read: false,
            kind: "Personal",
            section: "Rides",
        })
        .executeTakeFirst();
    await db.insertInto('notification')
        .values({
            user_id: Number(driver_id),
            title: "New Ride Assigned",
            message: `You have been assigned a new ride`,
            is_read: false,
            kind: "Personal",
            section: "Rides",
        })
        .executeTakeFirst();
    // return { message: "Ride assigned successfully" }
    return redirect("/rides");

}
function getWeekdaysBetweenDates(start_date: string, end_date: string) {
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    // use format of YYYY-MM-DD
    let weekdays: string[] = [];
    while (startDate <= endDate) {
        if (startDate.getDay() !== 0 && startDate.getDay() !== 6) {
            weekdays.push(startDate.toISOString().slice(0, 10));
        }
        startDate.setDate(startDate.getDate() + 1);
    }
    return weekdays;
}

