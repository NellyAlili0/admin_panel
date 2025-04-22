// read and write to a database
import { Loader } from '@googlemaps/js-api-loader';
export class Mapping {
    api_key: string
    // private googleMapsPromise: Promise<google.maps.Map>;
    constructor() {
        this.api_key = process.env.GOOGLE_MAPS_KEY!
    }

    async autocomplete(input: string) {
        let url = "https://maps.googleapis.com/maps/api/place/queryautocomplete/json?input=" + input + "&key=" + this.api_key
        const response = await fetch(url)
        const data = await response.json()
        return data
    }
    async getRoute({ origin, destination }: { origin: { latitude: number, longitude: number }, destination: { latitude: number, longitude: number } }) {
        let body = {
            "origin": {
                "location": {
                    "latLng": {
                        "latitude": origin.latitude,
                        "longitude": origin.longitude
                    }
                }
            },
            "destination": {
                "location": {
                    "latLng": {
                        "latitude": destination.latitude,
                        "longitude": destination.longitude
                    }
                }
            },
            "travelMode": "DRIVE",
            "routingPreference": "TRAFFIC_AWARE",
            "computeAlternativeRoutes": false,
            "routeModifiers": {
                "avoidTolls": false,
                "avoidHighways": false,
                "avoidFerries": false
            },
            "languageCode": "en-US",
            "units": "IMPERIAL"
        }
        let headers = {
            'X-Goog-Api-Key': this.api_key,
            'Content-Type': 'application/json',
            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
        }
        let url = 'https://routes.googleapis.com/directions/v2:computeRoutes'
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        })
        const data = await response.json()
        return data
    }

    async getDistance({ origin, destination }: { origin: string, destination: string }) {
        let url = "https://maps.googleapis.com/maps/api/distancematrix/json?destinations=" + destination + "&origins=" + origin + "&units=metric&key=" + this.api_key
        const response = await fetch(url)
        const data = await response.json()
        let distance = data['rows'][0]['elements'][0]['distance']['text']
        let duration = data['rows'][0]['elements'][0]['duration']['text']
        return { distance, duration }
    }
}