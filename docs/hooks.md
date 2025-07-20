## ✅ Hooks

### http://localhost:3001/api/hooks/location

✅ Authentication Required

- User must be logged in

HTTP METHODS

- POST

Required Fields

- driver_id: z.string(), // Required
- latitude: z.number(), // Required
- longitude: z.number(), // Required
- timestamp: z.number(), // Required
- kind: z.enum(["pickup", "dropoff"]).optional(), // Optional

- On Success (200 OK)

```json
{
  "status": "success"
}
```

- On failure (400)

```json
{
  "status": "error",
  "message": "Invalid data"
}
```

✅ What the code is doing (summary)

1. Validates incoming request body using a Zod schema to ensure proper types and structure.
2. Queries the database to find all daily_ride records where:
   - The ride is associated with the driver (user.email = driver_id)
   - The ride's kind matches the input (pickup or dropoff)
   - The ride's status is either "Active" or "Started"
3. Inserts a location record into the location table for each matching trip, containing:

- daily_ride_id
- latitude
- longitude

✅ Notes

- There is placeholder logic (commented out) for checking the meta.notifications field in daily_ride.meta which may be used to trigger notifications when certain distance thresholds (0.5km or 1km) are met. This is not active yet but shows future extensibility for proximity-based alerts.
- Timestamp is validated but not used in logic (could be used for tracking recency or time series later).

✅ Potential Enhancements

- Use the timestamp field to track time of location updates.
- Add rate limiting or deduplication logic if the driver sends location updates very frequently.
- Enable and implement the notification logic via meta.notifications.

### http://localhost:3001/api/hooks/mpesa/[action]

Nothing happens

### http://localhost:3001/api/hooks/mpesa/pay

Nothing happens
