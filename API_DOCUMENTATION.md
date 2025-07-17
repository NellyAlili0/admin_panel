# API DOCUMENTATION

## API

### http://localhost:3001/api

Type: GET
returns a success message

## AUTHENTICATION

### http://localhost:3001/api/auth/register

New user registration: Parent/Driver

Type: POST

Fields Required:

- names
- email
- password
- phone_number
- county
- neighborhood
- kind => Driver

returns an access token

### http://localhost:3001/api/auth/login

User Login: Parent/Driver

Type:POST

Fields Required:

- email
- password
- kind => Driver | Parent

returns an access token

### http://localhost:3001/api/auth/security

- Authentication Required

Password Change

Type: POST

Fields Required:

- old_password
- new_password

returns success status

## DRIVER

### http://localhost:3001/api/driver/

- Authentication Required

type: GET

This gets the drivers information which includes:

- name
- email
- phone_number
- meta
- kind
- created_at
- wallet_balance
- updated_at
- status

returns drivers information

### http://localhost:3001/api/driver/kyc

Authentication Required

Type: GET and POST

- GET METHOD

Returns the following kyc fields

- is_verified
- created_at
- updated_at

- POST METHOD

Requires the following fields:

- national_id_front
- national_id_back
- passport_photo
- driving_license
- certificate_of_good_conduct

### http://localhost:3001/api/driver/profile/notifications

- Authentication Required

Type: GET, PATCH, POST

- GET METHOD

Returns all the notifications with the following fields:
[title','message', 'is_read','kind','section', 'created_at']
the notifications are ordered using descending order, with a limit of 50 notifications.

- PATCH METHOD

This method updated the notification is_read field.
It is used to change the is_read status

- POST METHOD

Required Fields:

- start_trip_reminder: boolean
- trip_cancellation_alert: boolean
- delay_alerts: boolean
- payments_notifications: boolean
- shift_assignments: boolean

This one is used to update the users's meta's notification settings.

### http://localhost:3001/api/driver/trips

Authentication Required
Type: POST
Required Fields:

- action : view | history | today | pickup | pickup-all | dropoff | dropoff-all
- trip_id
- trips: an array of trips
- ride_id
- date

Action: Today
For example, if a driver logs into their dashboard, this query will return a list of their rides for today, sorted by time, showing:

- who they're picking up,
- where the child goes to school,
- what car they're driving,
- status of each ride.

- POST
  Action: History
  To get a list of past completed rides for a specific driver (payload.id), including details like: ride timing, vehicle used, student details, parent contact, and ride status.

Action: View
Fetches one specific trip's details, for a specific driver.

Action: Pickup
used to update the dairly_ride table to change the diarly_ride status to active

Action: Pickup-all
used to update the dairly_ride's tables to change the diarly_ride status to active

Action: dropoff
used to update the dairly_ride table to change the diarly_ride status to Finished

Action: dropoff-all
used to update the dairly_ride's tables to change the diarly_ride status to Finished.

- getParentEmailByTripId
  This function getParentEmailByTripId sends an email notification to the parent when a pickup or dropoff trip happens — but only if the parent has opted in for that type of notification.

### http://localhost:3001/api/driver/trips/manager

Authentication Required
Type: POST

Fields Required:

- action: today | start_all | end_all | update | students
- kind: dropoff | pickup
- student_id: number
- trip_id: number
- trips: number: trips[]
- ride_id: string
- date:string
- ride_update: embark | complete

Actions

Today:
Returns today's rides + count of total and upcoming.

returns:
{
rides: [...],
pickup: [...],
dropoff: [...],
total_trips: 20,
upcoming: 5
}

start_all:
Marks all today's rides (pickup or dropoff) as "Active" and notifies parents via email.

Steps:

- Loop all rides, get each student’s parent_id, fetch parent’s email.
- Update daily_ride.status = 'Active' for all trips.
- Send email like “Driver has started the trip”.

end_all:
Same as start_all but sets status to "Finished" and sends a “trip finished” email.

student:
Returns details of students on a trip and their current location/status.

Steps:

For each trip (pickup or dropoff):

Get latest coordinates from the location table

Fetch student info, parent info, and schedule

If the ride is active, use Mapping.getDistance() to calculate how far the bus is from the student's pickup point

Add calculated distance, duration, and status to each student

Returns:
{
status: "success",
students: [
{
id: ...,
name: "...",
profile_picture: "...",
distance: "1.2 km",
duration: "5 mins"
}
]
}

update:
Marks a specific student's ride as "Started" or "Finished" based on ride_update, and notifies the parent.

Steps:
Find today’s ride for the student_id
Update daily_ride.status to:

- "Started" if embark
- "Finished" if complete

Send notification to parent like:

- "Your child has been picked up"

### http://localhost:3001/api/driver/trips/daily

This query returns all rides scheduled for today, for the logged-in driver.

Each ride includes:

- Student info (name, ID, gender)
- Driver info (name, phone)
- Ride type (Pickup or Dropoff)
- Vehicle info
- Start and end times
- Ride status (Scheduled, Active, Finished, etc.)

### http://localhost:3001/api/driver/vehicle

Authentication Required

Type: POST, GET

- POST
  Register a vehicle (e.g. a bus, van, or car) to their account

Required Posts

- vehicle_name: z.string(),
- registration_number: z.string(),
- vehicle_type: z.enum(['Bus', 'Van', 'Car']),
- vehicle_model: z.string(),
- vehicle_year: z.number(),
- vehicle_image_url: z.string().optional(),
- seat_count: z.number(),
- vehicle_registration: z.string().optional(),
- insurance_certificate: z.string().optional(),

- GET
  Fetch their registered vehicle info
  Returns the following information:
  ['id', 'vehicle_name', 'registration_number', 'vehicle_type', 'vehicle_model', 'vehicle_year', 'vehicle_image_url', 'seat_count', 'available_seats', 'is_inspected', 'vehicle_registration', 'insurance_certificate', 'comments', 'status']

### http://localhost:3001/api/driver/wallet

This file defines a secure API endpoint that lets a driver do two main things:

- GET: Fetch their payment transaction history.
  Returns the folllowing fields:
  ['amount','kind','transaction_type','comments','transaction_id','created_at','updated_at']

- POST: Used to update the payout details (bank or M-Pesa).

Required Fields:

- kind: z.enum(['Bank', 'M-Pesa']),
- bank: z.string().optional(),
- account_name: z.string().optional(),
- account_number: z.string().optional(),

## HOOKS

### http://localhost:3001/api/hooks/location

Authentication Required:

Type: POST

Required Fields:

- driver_id: z.string()
- latitude: z.number()
- longitude: z.number()
- timestamp: z.number()
- kind: z.enum(["pickup", "dropoff"]).optional()

This code defines an API route (POST) that receives a driver's real-time location update (latitude, longitude, timestamp), finds active trips assigned to that driver, and saves the location for each active trip.
The location table is likely used for driver tracking, notifications, or route visualization.

### http://localhost:3001/api/hooks/mpesa/pay

Currently doing nothing

### http://localhost:3001/api/hooks/mpesa/[action]

Currently doing nothing

## LOCATION

### http://localhost:3001/api/location

Type: POST

Required Fields:

- daily_ride_id

This API endpoint takes a daily_ride_id as input and returns the most recent GPS coordinates (latitude and longitude) associated with that ride from the location table.

## PARENT

### http://localhost:3001/api/parent

Authentication Required

Type: POST and GET

This code defines a REST API endpoint for managing a parent user's profile. It handles two HTTP methods: GET (for fetching user profile data) and POST (for updating it).

- GET

It queries the user table to get the currently logged-in user's:
[name, email, phone_number, created_at, updated_at, and status]
This query returns this object:
{
"status": "success",
"parent": {
"name": "Fridah",
"email": "fridah@example.com",
"phone_number": "0700000000",
"created_at": "...",
"updated_at": "...",
"status": "active"
}
}

- POST

📝 POST request: Updates parent profile

- Looks for the current user in the database
- Set the new name, email, and phone_number (fall back to existing values if optional fields are missing).
- Update the meta field (merging with existing metadata, if any).

### http://localhost:3001/api/parent/notifications

Authentication Required

Type: POST and GET

This code defines an API route that handles notifications for a user, with two HTTP methods: GET and POST.

GET

- Fetches the last 50 notifications for a user
- Count how many are unread
- Mark all as read
- Fetch notification settings from user’s meta field
- If no settings found in meta.notifications, fallback to default
- 5. Return JSON response
     {
     status: 'success',
     notifications,
     unreadCount,
     settings
     }

POST:
Used to update Notification Settings

- Fetch user & update meta.notifications
- Merge new notification settings into meta and save
- Return success response

🧠 Summary
✅ GET: Returns the latest 50 notifications, unread count, and current notification settings.
✅ POST: Accepts a new notification setting config and stores it under user.meta.notifications.
🔐 Both routes are protected by an API token (via the Auth class).

### http://localhost:3001/api/parent/students

Authentication Required

Type: GET and POST

- GET

This query retrieves all students belonging to the authenticated parent (parent_id = payload.id).
Only selects name, gender, and id.

returns this json:
{
"status": "success",
"students": [
{ "id": 1, "name": "Alex", "gender": "Male" },
...
]
}

- POST

Required Fields

- names: z.string(),
- gender: z.enum(['Male', 'Female']),
- address: z.string().optional(),
- profile_picture: z.string().optional()

Adds a new student record for the logged-in parent.
Only returns key student fields in the response.

returns this json:
{
"status": "success",
"student": {
"id": 2,
"name": "Mary",
"gender": "Female"
}
}

### http://localhost:3001/api/parent/trips

Authentication Required

Type: POST

Required Fields

- action: z.enum(['create', 'view', 'history', 'today', 'all', 'view_trip']),
- student_id: z.number().optional(),
- ride_id: z.number().optional(),
- trip_id: z.number().optional(),
- date: z.string().optional(),
- schedule: z.object({
  - pickup: z.object({
    start_time: z.string(),
    location: z.string(),
    latitude: z.number(),
    longitude: z.number()
    }),
  - dropoff: z.object({
    start_time: z.string(),
    location: z.string(),
    latitude: z.number(),
    longitude: z.number()
    }),
  - comments: z.string().optional(),
  - dates: z.array(z.string()).optional(),
  - kind: z.enum(['Private', 'Carpool', 'Bus']).optional()
    }).optional()

🎯 Actions Supported

1. create – Request a New Ride

Requires: student_id and schedule

Steps:

- Validates if the student exists and belongs to the authenticated parent.
- Inserts a new ride with status Requested.
- Logs a notification and sends an email.

2. all – Get All Rides for Parent

- Fetches all ride records (past, present, future) for the logged-in parent.
- Includes student name, driver info, vehicle, school, schedule, status, etc.

3. history – Ride History (Completed Trips)

- Retrieves all daily_ride records associated with a parent.
- Includes driver, student, vehicle, and school info.
- Great for ride logs, receipts, or analytics.

4. today – Get Rides for Today

- Filters rides by today’s date (or a provided date).
- Useful for showing today’s pickup/drop-off plan.

Includes:

- Driver name & phone
- Vehicle info
- Ride type (kind)
- Start & end time

5. view – View a Specific Ride

Fields Required

- ride_id

Returns all daily_ride entries associated with that ride (across days).
Helpful for viewing an overview of a multi-day scheduled ride.

6. view_trip – View a Specific Trip Instance

Fields Required

- trip_id
- date

Returns a single daily_ride entry (i.e., a single day's trip)
Also fetches the most recent GPS location for that trip from the location table.

## MAP

### http://localhost:3001/map/[slug]

- It receives a dynamic route parameter from the URL, like /location/nairobi, where params.slug would be "nairobi".
- It renders a full-screen iframe that embeds the Google Map for the location specified by the slug.
- If you visit /location/nairobi, the component renders a Google Map for Nairobi using the Embed API.

### http://localhost:3001/map/watch and http://localhost:3001/map/way

This is a real-time map page (Page) that:

- Fetches a driver's location and ride data from the database
- Displays the driver, pickup, and drop-off points on a Google Map
- Listens for live location updates using Socket.IO
- Updates the driver's marker position on the map in real time

## HANDLERS

Packages/handlers

### Notify

There is a class called Notify
create a new instance : new Notify()

Notify Methods:

- sendSingle(title, message, email) => title:string, message:string, email: string || null
- sendBulk(title, message, segment, big_picture) => title:string, message:string, segment:string, big_picture:string

### Mail

There is a class called Mail
create a new instance : new Mail()

Mail Methods: sendSTMP({ subject, html, email, name })=> subject:string, html:string, email:string, name:string

### Auth

There is a class called Auth
create a new instance : new Auth()

Auth Methods:

- encode(payload) : encodes a payload and returns it as an access token

payload = {
id: user.id,
kind: user.kind,
email: user.email,
phone_number: user.phone_number,
}

- decodes (token) : decodes the token and returns a payload

- admin_decode(token,role): decodes the token and returns a payload

- hash(password) : returns a hashed password

- compare(password, hash) : compares the password provided with a hashed password from the database

- checkApiToken(req) : checks the access token in the request's header: {
  Authorization: `Bearer ${token}`
  } => if the token is found, it returns the payload and if not, it returns null

### Mapping

There is a class called Mapping
create a new instance : new Mapping()

Mapping Methods:

- autocomplete(input: string)

filters google maps locations and returns a list of possible locations for the client to choose.

- getRoute({origin, destination})

origin and destination both contain latitude and longitude

origin: {latitude:number, longitude:number}
destination: {latitude:number, longitude:number}

Returns the parsed JSON, which contains route information (duration, distance, polyline).

- getDistance({origin, destination})

origin and destination both contain latitude and longitude

origin: {latitude:number, longitude:number}
destination: {latitude:number, longitude:number}

It takes in origin and destination and returns distance and duration

### Payments

There is a class called Payments

```tsx
class Payments {
  constructor() {
    this.mpesa_shortcode = process.env.MPESA_SHORTCODE!;
    this.mpesa_passkey = process.env.MPESA_PASSKEY!;
    this.mpesa_key = process.env.MPESA_KEY!;
    this.mpesa_secret = process.env.MPESA_SECRET!;
  }
}
```

create a new instance : new Payments()

Payments Methods:

- generateToken()
  returns an access token from safaricom

- getTimestamp()
  returns `${year}${month}${day}${hours}${minutes}${seconds}`

- getPassword(timestamp: string)

it takes in a timestamp and returns a password

- stkpush( phone: string, ref: string, amount: number, code: string, callback_url: string)

This stkpush function is for initiating an M-Pesa STK Push payment.

- Authenticates with Safaricom’s M-Pesa API
- Generates the STK push payload
- Sends a payment request to a user's phone
- Returns the API response if successful

- verify({ ref })

Purpose:
To check the status of a previously initiated STK Push transaction using the Checkout Request ID (ref).

- confirmation({ tran_id, amount, refnumber })

Purpose:
To process and store M-Pesa C2B payment confirmation sent by Safaricom to your backend after a successful transaction. This is usually triggered via a POST request to your /confirmation endpoint by Safaricom.

- validation({ tran_id, amount, refnumber })

Purpose:
To pre-screen an incoming payment before Safaricom finalizes it. Safaricom calls this when a user tries to pay your Paybill/Till.

This is your chance to reject payments that are: Wrong amount, Wrong reference number, Not expected (e.g. no active order).

### Storage

There is a class called Storage
create a new instance : new Storage()

Storage Methods:

- upload({key, body })

Upload KYC files to an S3 bucket.

- getDownloadUrl({key})

Retrieve them later for review or download.
