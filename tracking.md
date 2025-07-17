# Tracking Documentation

## POSTS LOCATION DATA FOR EACH DRIVER AND SAVES IT TO THE DATABASE

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

### http://localhost:3001/api/location

Type: POST

Required Fields:

- daily_ride_id

This API endpoint takes a daily_ride_id as input and returns the most recent GPS coordinates (latitude and longitude) associated with that ride from the location table.

## ADMIN LIVE FUNCTIONALITY

## http://localhost:3001/admin/api/live

🧠 High-Level Overview
Get Active Drivers from the daily_ride table.
For each driver:

- Fetch their last location from the location table.
- Count how many rides they've done.
- Return all this info as a JSON response.

This endpoint is for live tracking and monitoring of all drivers currently on a ride. It aggregates:

- Basic driver info
- Vehicle details
- Most recent location
- Number of rides or passengers
- It’s likely used on a dashboard for admins or parents to view all drivers at once.

## http://localhost:3001/admin/live

This React component, DriverTrackingMap, is a real-time driver tracking dashboard using the Google Maps API. It visually displays all active drivers on a map, showing their location, passenger count, and other info.

Main Purpose:
📍 To display all active drivers (fetched from /api/live) on a Google Map, updating every 3 seconds, and allow the user to see their profile info and stats like total drivers and passengers.

What is happening:
| Feature | Description |
| -------------------- | ------------------------------------------- |
| 📡 Real-time updates | Fetches driver data every 3 seconds |
| 🗺️ Google Maps | Visually displays driver locations |
| 🎨 Custom icons | Uses canvas-drawn icons to show status |
| 💬 Info popups | Clicking a marker shows driver info |
| 📊 Stats panel | Shows live counts of drivers and passengers |
| 🧭 Navigation | Buttons link to individual driver profiles |
