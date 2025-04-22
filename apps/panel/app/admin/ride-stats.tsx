"use client"

import { PieChart, Pie, Cell, Tooltip } from "recharts"

const data = [
    { name: "School Rides", value: 45, color: "#3b82f6" },
    { name: "After-School", value: 25, color: "#10b981" },
    { name: "Weekend", value: 15, color: "#f59e0b" },
    { name: "Special Events", value: 15, color: "#8b5cf6" },
]

const statusData = [
    { name: "Completed", value: 85, color: "#10b981" },
    { name: "Canceled", value: 10, color: "#f43f5e" },
    { name: "No-Show", value: 5, color: "#6b7280" },
]

export function RideStatistics() {
    return (
        <div className="space-y-6">
            <div className="h-[200px]">
                <h3 className="text-sm font-medium mb-2">Ride Types</h3>

                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </div>
        </div>
    )
}
