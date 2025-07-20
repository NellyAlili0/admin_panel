## ✅ Driver

### http://localhost:3001/api/driver/

✅ Authentication Required

- User must be logged in

HTTP METHODS

1. GET
   No required Fields

This method returns the following object:

- On Success (200 OK)

```json
{
  "status": "success",
  "message": "User found",
  "driver": {
    "name": "string",
    "email": "string",
    "phone_number": "string",
    "meta": "any",
    "kind": "string",
    "created_at": "string",
    "wallet_balance": "number",
    "updated_at": "string",
    "status": "string"
  }
}
```

- On Failure (401 unauthorised)

```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

📝 Summary

This api endpoint retrieves the logged in driver's information and returns it.

### http://localhost:3001/api/driver/kyc

✅ Authentication Required

- User must be logged in

HTTP METHODS

1. GET

This method retrives the KYC verification status for the currrently logged in driver.

This method returns the following object:

- On Success (200 OK)

```json
{
  "status": "success",
  "kyc": [
    {
      "is_verified": boolean,
      "created_at": "timestamp",
      "updated_at": "timestamp"
    },
    ...
  ]
}
```

- On failure (401 Unauthorized)

```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

2. POST

Fields Required

- national_id_front: string
- national_id_back: string
- passport_photo: string
- driving_license: string
- certificate_of_good_conduct: string

This method returns the following object:

- On Success (200 OK)

```json
{
  "status": "success"
}
```

- On invalid data (400 Bad Request)

```json
{
  "status": "error",
  "message": "Invalid data"
}
```

Once the kyc is successfully added to the kyc database, a nofification is sent to the drivers email.

📝 Summary
This api endpoint has two methods:

- The Get method is used to retrieve the verification status of the current logged in driver and Returns is_verified, created_at, and updated_at fields (up to 5 records).
- The Post method is used to submit the drivers KYC documents. After the kyc documents are submitted a notification is sent to the drivers email.

### http://localhost:3001/api/driver/profile/notifications

✅ Authentication Required

- User must be logged in

HTTP METHODS

1. GET

This method fetches a maximum of 50 notifications.
The method returns the following object:

- On Success (200 OK)

```json
{
  "status": "success",
  "notifications": [
    {
      "title": "string",
      "message": "string",
      "is_read": true,
      "kind": "string",
      "section": "string",
      "created_at": "timestamp"
    },
    ...
  ]
}
```

- On failure (401 Unauthorized)

```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

2. PATCH

The patch method is used for marking notifications as read.

Required Fields

- No fields

- On Success (200 OK)

```json
{
  "status": "success"
}
```

- On failure (401 Unauthorized)

```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

3. POST

The post method is used to update the driver's notification settings.

Required Fields

- start_trip_reminder: boolean
- trip_cancellation_alert: boolean
- delay_alerts: boolean
- payments_notifications: boolean
- shift_assignments: boolean

- On Success (200 OK)

```json
{
  "status": "success"
}
```

- On failure (400 Bad Request)

```json
{
  "status": "error",
  "message": "Invalid data"
}
```

### http://localhost:3001/api/driver/vehicle

✅ Authentication Required

- User must be logged in

HTTP METHODS

1. POST

This method is used to register a new vehicle for the logged in driver.

Required Fields:

- registration_number: string
- vehicle_type: "Bus" | "Van" | "Car"
- vehicle_name: string
- vehicle_model: string
- vehicle_year: number
- seat_count: number
- vehicle_image_url: string (optional)
- vehicle_registration: string (optional)
- insurance_certificate": string (optional)

- On Success (200 OK)

```json
{
  "status": "success"
}
```

- On failure (400 Bad Request)

1. Invalid Request Body

```json
{
  "status": "error",
  "message": "Invalid data"
}
```

2. Driver already has a vehicle

```json
{
  "status": "error",
  "message": "Driver already has a vehicle"
}
```

3. Duplicate registration number

```json
{
  "status": "error",
  "message": "Vehicle registration number already exists"
}
```

2. GET

This method is used to retrive the current vehicle details for the logged in driver.

- On Success (200 OK)

```json
{
  "status": "success",
  "vehicle": {
    "id": number,
    "vehicle_name": "string",
    "registration_number": "string",
    "vehicle_type": "Bus" | "Van" | "Car",
    "vehicle_model": "string",
    "vehicle_year": number,
    "vehicle_image_url": "string | null",
    "seat_count": number,
    "available_seats": number,
    "is_inspected": boolean,
    "vehicle_registration": "string | null",
    "insurance_certificate": "string | null",
    "comments": "string | null",
    "status": "string"
  }
}

```

- On failure (401 Unauthorized)

```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

### http://localhost:3001/api/driver/wallet

✅ Authentication Required

- User must be logged in

HTTP METHODS

1. GET

This method retrieves a list of all payment transactions associated with the currently authenticated user.

- On Success (200 OK)

```json
{
  "status": "success",
  "transactions": [
    {
      "amount": number,
      "kind": "string",
      "transaction_type": "string",
      "comments": "string | null",
      "transaction_id": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    },
  ]
}
```

- On failure (401 Unauthorized)

```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

2. POST

Allows the authenticated user to set or update their payout method (either via Bank or M-Pesa).

Required Fields

- kind: "Bank" | "M-Pesa"
- bank: string (optional)
- account_name: string (optional)
- account_number: string (optional)

- On Success (200 OK)

```json
{
  "status": "success"
}
```

- On failure (400 Bad Request)

```json
{
  "status": "error",
  "message": "Invalid data"
}
```

- On failure (401 Unauthorized)

```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

### http://localhost:3001/api/driver/trips

✅ Authentication Required

- User must be logged in

HTTP METHODS

- POST

Handles multiple actions related to student trips.

Required Fields

- action: "view" | "history" | "today" | "pickup" | "pickup-all" | "dropoff" | "dropoff-all"
- trip_id: number (optional)
- trips: number[] (optional)
- ride_id: string (optional)
- date: string (optional) // format: "YYYY-MM-DD"

- On Success (200 OK)

```json
{
  "status": "success",
  ... // varies per action
}
```

- On failure (401 Unauthorized)

```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

- On failure (400 Bad Request)

```json
{
  "status": "error",
  "message": "Invalid data"
}
```

- On failure (404 Trip Not Found)

```json
{
  "status": "error",
  "message": "Trip not found"
}
```

- On failure (400 invalid action)

```json
{
  "status": "error",
  "message": "Invalid action"
}
```

What each action is doing:

🔹 action === "today"

- Fetches today's rides for the logged in driver.
- Can optionally fetch for a specified date (date).
- Splits into pickup and dropoff rides based on type.

🔹 action === "history"

- Retrieves finished (completed) trips for the driver.
- Returns detailed info including vehicle, student, and schedule data.

🔹 action === "view"

- Fetches specific trip details using trip_id.
- Returns both trip metadata and location history.

🔹 action === "pickup" (single trip)

- Sets trip status to "Active".
- Sends email notification to parent if allowed.

🔹 action === "pickup-all"

- Activates multiple trips using the trips[] array.
- Sends notification emails for each trip.

🔹 action === "dropoff" (single trip)

- Sets trip status to "Finished".
- Sends dropoff email notification to parent if allowed.

🔹 action === "dropoff-all"

- Marks multiple trips as finished.
- Sends notification emails to all relevant parents.

📬 getParentEmailByTripId(trip_id)

- Looks up the parent’s email and notification preferences for a trip.
- Sends a pickup or dropoff notification email if enabled.

🗓️ formatDate(date)

- Formats a JavaScript Date to YYYY-MM-DD format.

### http://localhost:3001/api/driver/trips/daily

✅ Authentication Required

- User must be logged in

HTTP METHODS

- POST

Required Fields

- None

This endpoint is designed for drivers to retrieve a dashboard-like summary of their ride schedule and stats.

Fetches all rides scheduled for the driver today (daily_ride.date = today) including:

- Student info (passenger name, ID, parent ID, gender)
- Ride kind (Pickup or Dropoff)
- Driver info (name, phone)
- Vehicle info
- Ride time window (start/end)
- Ride status

Calculates three summaries:

- Total rides (across all time)
- Upcoming rides (future dates)
- Today's pickups count
- Today's dropoffs count

Returns all that data in a JSON response.

- On Success (200 OK)

```json
{
  "status": "success",
  "rides": [ ... ],         // Today's rides for the driver
  "total_trips": number,    // Total number of rides ever assigned to this driver
  "upcoming": number,       // Number of rides scheduled after today
  "pickups": number,        // Count of "Pickup" rides today
  "dropoffs": number        // Count of "Dropoff" rides today
}

```

- On failure (401 Unauthorized)

```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

### http://localhost:3001/api/driver/trips/manager

✅ Authentication Required

- User must be logged in

HTTP METHODS

- POST

Required Fields

- action: z.enum(['today', 'start_all', 'end_all', 'update', 'students'])
- kind: z.enum(['pickup', 'dropoff']).optional()
- student_id: z.number().optional(),
- trip_id: z.number().optional(),
- trips: z.array(z.number()).optional(),
- ride_id: z.string().optional(),
- date: z.string().optional(),
- ride_update: z.enum(['embark', 'complete']).optional()

✅ Actions and What They Do

1. action: 'today'

🟢 Returns:

- Driver’s rides today
- Total trips ever
- Upcoming trips (future dates)
- Today's pickups
- Today's dropoffs

🔁 Output Example:

```json
{
  "status": "success",
  "rides": [...],
  "pickup": [...],
  "dropoff": [...],
  "total_trips": 12,
  "upcoming": 5
}
```

2. action: 'start_all'

✅ Required:

kind — either 'pickup' or 'dropoff'

🛠️ Behavior:

- Marks all today's rides of that kind as Active
- Sends email notification to parents:
  - Title: 'Trip Pickup' or 'Trip Dropoff'
  - Message: 'Driver has started the trip'

🔁 Returns:

```json
{
  "status": "success"
}
```

3. action: 'end_all'

✅ Required:

kind — either 'pickup' or 'dropoff'

🛠️ Behavior:

- Marks all today's rides of that kind as Finished
- Sends notification emails to parents:
  - Message: 'Driver has finished the trip'

🔁 Returns:

```json
{
  "status": "success"
}
```

4. action: 'students'

✅ Required:

kind — 'pickup' or 'dropoff'

🛠️ Behavior:

- For each ride of today (filtered by kind):
- Looks up the student and parent's info
- If the ride is Active, it fetches last known coordinates
- Calculates estimated distance/duration to student's pickup point via Mapping.getDistance()

🔁 Returns:

```json
{
"status": "success",
"students": [
{
"id": 1,
"name": "Jane",
...
"distance": "3 km",
"duration": "7 mins"
}
]
}
```

5. action: 'update'

✅ Required:

- kind: 'pickup' | 'dropoff'
- student_id: number
- ride_update: 'embark' | 'complete'

🛠️ Behavior:

- Finds the student’s ride for today
- Updates their ride:
- status: 'Started' if 'embark', else 'Finished'
- end_time: current timestamp
- Sends parent a notification:
  - "Your child has been picked up" or "dropped off"

🔁 Returns:

```json
{
  "status": "success"
}
```

🔁 If request body doesn't match schema:

```json
{
  "status": "error",
  "message": "Invalid data"
}
```

🔁 If update action and student not found:

```json
{
  "status": "error",
  "message": "Student not found"
}
```
