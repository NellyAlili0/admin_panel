## ✅ Parent

### http://localhost:3001/api/parent/

✅ Authentication Required

- User must be logged in

HTTP METHODS

1. GET

Fetches the logged in parent's profile details

This method returns:

```json
{
  "status": "success",
  "parent": {
    "name": "...",
    "email": "...",
    "phone_number": "...",
    "created_at": "...",
    "updated_at": "...",
    "status": "..."
  }
}
```

2. POST

This method is used to update the logged in parent's profile details.
It authenticates the request, validates the incoming data, updates the user's name, email, and phone number, and saves it in the database.

Required Fields:

- name: string => required
- email: string => optional
- phone_number: string => optional

- On Success (200 OK)

```json
{
  "status": "success",
  "parent": 1 // number of rows updated (if using `executeTakeFirst()`, may return undefined)
}
```

- Invalid data

```json
{
  "status": "error",
  "message": "Invalid data"
}
```

- Unauthorised

```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

- User not found

```json
{
  "status": "error",
  "message": "User not found"
}
```

### http://localhost:3001/api/parent/notifications

✅ Authentication Required

- User must be logged in

HTTP METHODS

- GET
  This Fetches user notifications and notification settings.

🔹 Purpose:

- Retrieve the latest 50 notifications for the logged-in user.
- Count how many are unread.
- Mark all notifications as read.
- Return user's notification preferences (settings).

- On Success (200 OK)

```json
{
  "status": "success",
  "notifications": [
    {
      "title": "...",
      "message": "...",
      "kind": "...",
      "section": "...",
      "is_read": false,
      "created_at": "..."
    },
    ...
  ],
  "unreadCount": 4,
  "settings": {
    "when_bus_leaves": true,
    "when_bus_makes_home_drop_off": true,
    ...
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

- On failure (404)

```json
{
  "status": "error",
  "message": "User not found"
}
```

- POST

This is used to update a user's notification settings/preferences.

Required Fields

- when_bus_leaves: boolean
- when_bus_makes_home_drop_off: boolean
- when_bus_make_home_pickup: boolean
- when_bus_arrives: boolean
- when_bus_is_1km_away: boolean
- when_bus_is_0_5km_away: boolean

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

- On failure (404)

```json
{
  "status": "error",
  "message": "User not found"
}
```

- On failure (400)

```json
{
  "status": "error",
  "message": "Invalid data"
}
```

### http://localhost:3001/api/parent/students

✅ Authentication Required

- User must be logged in

HTTP METHODS

- GET
  Retrieves a list of students linked to the current logged-in parent.

- On Success (200 OK)

```json
{
  "status": "success",
  "students": [
    {
      "name": "John Doe",
      "gender": "Male",
      "id": 123
    }
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

- POST
  Adds a new student under the authenticated parent.

Required Fields

- names: string()
- gender: z.enum(["Male", "Female"])
- address: z.string().optional()
- profile_picture: z.string().optional()

- On Success (200 OK)

```json
{
  "status": "success",
  "students": [
    {
      "name": "John Doe",
      "gender": "Male",
      "id": 123
    }
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

- On failure (invalid data)

```json
{
  "status": "error",
  "message": "Invalid data"
}
```

### http://localhost:3001/api/parent/trips

✅ Authentication Required

- User must be logged in

HTTP METHODS

- POST

Required Fields

- action: z.enum(["create", "view", "history", "today", "all", "view_trip"]),
- student_id: z.number().optional(),
- ride_id: z.number().optional(),
- trip_id: z.number().optional(),
- date: z.string().optional(),
- schedule: z.object({
  - pickup: z.object({
    - start_time: z.string(),
    - location: z.string(),
    - latitude: z.number(),
    - longitude: z.number(),
      }),
    - dropoff: z.object({
      - start_time: z.string(),
      - location: z.string(),
      - latitude: z.number(),
      - longitude: z.number(),
        }),
    - comments: z.string().optional(),
    - dates: z.array(z.string()).optional(),
    - kind: z.enum(["Private", "Carpool", "Bus"]).optional(),
      })
      .optional()

ACTIONS

🔹 create:

- Creates a new ride request

returns:

```json
{
    status: "success", ride: { id }
}
```

🔹 all:

- Returns all rides for the parent

```json
{
    status: "success",
    rides: [...]
}
```

🔹 history:

- Returns ride history from daily_ride table

```json
{
    status: "success", rides: [...]
}

```

🔹 today:

- Returns today's rides based on date or system date.

```json
{
    status: "success",
    rides: [...]
}
```

🔹 view:

- Returns details for a specific ride (ride_id)

```json
{
    status: "success",
    rides: [...]
}
```

🔹 view_trip:

- Returns detailed info for a specific trip (trip_id) and its location data

```json
{
    status: "success",
    rides: [...]
}
```
