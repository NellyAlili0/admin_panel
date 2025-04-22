import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, CarIcon, MapPinIcon } from "lucide-react"

export function RecentTrips({ trips }: { trips: any }) {
    return (
        <div className="space-y-4">
            {trips.map((trip) => (
                <div key={trip.id} className="flex items-start space-x-4 rounded-lg border p-3">
                    <Avatar className="text-primary" >
                        <AvatarFallback>
                            <CarIcon className="h-4 w-4" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium leading-none">{trip.vehicle}</p>
                            <Badge variant="outline" className="text-xs">
                                {trip.status}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Driver: {trip.first_name} {trip.last_name}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                            <MapPinIcon className="mr-1 h-3 w-3" />
                            <span>
                                {trip.meta?.startLocation} → {trip.meta?.endLocation}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center">
                                <CalendarIcon className="mr-1 h-3 w-3" />
                                <span>{trip.start_time} - {trip.end_time}</span>
                            </div>
                            <span>{trip.meta?.distance}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
