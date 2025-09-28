# Zidallie Platform

## Installation

```bash
pnpm install
```

## Database Migration

```bash
cd packages/database
npx kysely migrate:up

```

## Running the app

```bash
pnpm dev
```

## Environment variables

```bash
.env
```

import { client } from '@/api';
import { FocusAwareStatusBar } from '@/components/ui';
import { connectSocket } from '@/lib/socket';
import { Env } from '@env';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

type TripInfo = {
id: string;
studentName: string;
kind: 'Pickup' | 'Dropoff';
date: string;
scheduleTime?: string;
status: 'Inactive' | 'Ongoing' | 'Finished';
pickupLocation?: string;
dropoffLocation?: string;
pickupCoords: { latitude: number; longitude: number };
dropoffCoords: { latitude: number; longitude: number };
driver: { id: string; name: string };
};

type RootStackParamList = {
TripMap: { trip: TripInfo };
};

type TripMapRouteProp = RouteProp<RootStackParamList, 'TripMap'>;

export default function DriverMap() {
const route = useRoute<TripMapRouteProp>();
const navigation = useNavigation();
const { trip } = route.params;
const mapRef = useRef<MapView>(null);

    if (!trip.driver?.id) {
        return <View><Text>Loading</Text></View>
    }

    const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);


    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        const socket = connectSocket();

        socket.connect();

        // connection established
        socket.on('connect', () => {
            console.log(' socket connected:', socket.id);
            socket.emit('joinDriver', Number(trip.driver?.id));
        });

        //connection error
        socket.on('connect_error', (err) => {
            console.error('Parent socket connection error:', err.message, err);
        });

        // generic errors from server
        socket.on('error', (err) => {
            console.error('Socket server error:', err);
        });

        socket.on('disconnect', (reason) => {
            console.warn('Parent socket disconnected:', reason);
            interval = setInterval(fetchDriverLocation, 30000);
        });

        socket.on('locationBroadcast', (payload: any) => {
            console.log("driver_location", payload);
            setDriverLocation({
                latitude: parseFloat(payload.latitude),
                longitude: parseFloat(payload.longitude),
            });
        });

        const fetchDriverLocation = async () => {
            try {
                const response = await client.get(`/locations/driver/${trip.driver?.id}/latest`);
                if (response.data) {
                    setDriverLocation({
                        latitude: parseFloat(response.data.latitude),
                        longitude: parseFloat(response.data.longitude),
                    });
                }
            } catch (err) {
                console.error('Error fetching driver location', err);
            }
        };

        fetchDriverLocation();

        return () => {
            socket.disconnect();
            if (interval) clearInterval(interval);
        };
    }, [trip.driver?.id]);



    const origin = driverLocation || trip.pickupCoords;
    const destination = trip.kind === 'Pickup' ? trip.pickupCoords : trip.dropoffCoords;

    return (
        <SafeAreaView style={styles.container}>
            <FocusAwareStatusBar />
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: origin?.latitude,
                    longitude: origin?.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                {driverLocation && (
                    <Marker
                        coordinate={driverLocation}
                        title="Driver"
                        image={require('./../../assets/images/bus.png')}
                    />
                )}

                <Marker
                    coordinate={destination}
                    title={trip.kind === 'Pickup' ? 'Pickup Location' : 'Dropoff Location'}
                    pinColor="#e76f51"
                />
                {driverLocation && (
                    <MapViewDirections
                        origin={origin}
                        destination={destination}
                        apikey={Env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}
                        strokeWidth={4}
                        strokeColor="#2a9d8f"
                        onReady={(result) => {
                            setDistance(result.distance); // distance in km
                            mapRef.current?.fitToCoordinates(result.coordinates, {
                                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                                animated: true,
                            });
                        }}
                    />
                )}
            </MapView>

            {/* Floating Driver Card */}
            {distance !== null && (
                <View style={styles.floatingCard}>
                    <Image
                        source={require('./../../assets/images/driver.png')}
                        style={styles.driverIcon}
                    />
                    <Text style={styles.cardText}>
                        Driver is {distance.toFixed(1)} km away
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );

}

const styles = StyleSheet.create({
container: { flex: 1 },
map: { flex: 1 },
backButton: {
position: 'absolute',
top: 16,
left: 16,
zIndex: 10,
backgroundColor: '#fff',
padding: 8,
borderRadius: 8,
shadowColor: '#000',
shadowOpacity: 0.1,
shadowRadius: 4,
},
backText: { fontSize: 16, color: '#2a9d8f', fontWeight: 'bold' },
floatingCard: {
position: 'absolute',
bottom: 30,
left: '10%',
right: '10%',
backgroundColor: '#fff',
borderRadius: 12,
flexDirection: 'row',
alignItems: 'center',
padding: 12,
shadowColor: '#000',
shadowOpacity: 0.15,
shadowRadius: 6,
elevation: 4,
},
driverIcon: { width: 32, height: 32, marginRight: 10 },
cardText: { fontSize: 16, fontWeight: '500', color: '#333' },

    SOCKET CONFIG IMPORTED FILE


    //@Lib/socket
    import { io, Socket } from 'socket.io-client';

import { Env } from '@env';

let socket: Socket | null = null;

export const connectSocket = () => {
if (!socket) {
socket = io(`${Env.API_URL}`, {
transports: ['websocket'], // force WebSocket only
autoConnect: false,
});
}
return socket;
};

export const disconnectSocket = () => {
if (socket) {
socket.disconnect();
socket = null;
}
};

});
