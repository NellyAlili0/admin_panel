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
        <Card className="overflow-hidden px-1 py-2">
            <CardHeader className="p-0">
                <div className="flex flex-col justify-between items-start">
                    <CardTitle className="text-lg">{name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{licensePlate}</p>
                </div>
            </CardHeader>
            <CardContent className="px-1 py-1">
                <div className="space-y-0">
                    <div className="flex items-center text-sm">
                        <span>Available: {available_seats}</span>
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
            <CardFooter className="p-0">
                <Button asChild className="w-full">
                    <Link href={`/vehicles/${id}`}>View Details</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
