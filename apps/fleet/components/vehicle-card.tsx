import Link from "next/link"
import { Calendar, Fuel } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "./ui/progress"

interface VehicleCardProps {
    id: string
    name: string
    licensePlate: string
    status: "Available" | "On trip" | "In Use" | "Maintenance" | "Finished" | "Started" | "Inactive" | "Active"
    available_seats: number
    total_seats: number
}

export function VehicleCard({ id, name, licensePlate, status, available_seats, total_seats }: VehicleCardProps) {
    const statusColor = {
        Available: "bg-green-500",
        "In Use": "bg-blue-500",
        Maintenance: "bg-amber-500",
        Inactive: "bg-gray-500",
        Active: "bg-green-500"
        
    }[status]

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{name}</CardTitle>
                    <Badge variant="outline" className="font-normal">
                        <span className={`mr-1.5 h-2 w-2 rounded-full ${statusColor}`} />
                        {status}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{licensePlate}</p>
            </CardHeader>
            <CardContent className="pb-2">
                <div className="space-y-2">
                    <div className="flex items-center text-sm">
                        <span>Available Seats: {available_seats}</span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                                <span>Total Seats: {total_seats} </span>
                            </div>
                        </div>
                        <Progress value={total_seats - available_seats} className="h-2" />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href={`/vehicles/${id}`}>View Details</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
