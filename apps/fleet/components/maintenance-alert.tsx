import { Calendar, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function MaintenanceAlert({ alerts }: { alerts: any[] }) {
    return (
        <div className="space-y-4">
            {alerts.map((alert) => (
                <div key={alert.id} className="flex flex-col space-y-2 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{alert.vehicle}</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{alert.licensePlate}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {alert.start_date}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {alert.next_maintenance}</span>
                    </div>
                    <Button size="sm" asChild>
                        <Link href={`/vehicle/${alert.id}`}>View Vehicle</Link>
                    </Button>
                </div>
            ))}
        </div>
    )
}
