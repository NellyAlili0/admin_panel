"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Car, Home, LogOutIcon, Settings, PenToolIcon as Tool } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { logout } from "@/app/login/actions"

export function Navbar() {
    const pathname = usePathname()

    const routes = [
        {
            href: "/home",
            label: "Home",
            icon: Home,
            active: pathname === "/home",
        },
        // {
        //     href: "/vehicles",
        //     label: "Vehicles",
        //     icon: Car,
        //     active: pathname === "/vehicles" || pathname.startsWith("/vehicles/"),
        // },
        {
            href: "/maintenance",
            label: "Maintenance Logs",
            icon: Tool,
            active: pathname === "/maintenance" || pathname.startsWith("/maintenance/"),
        },
        {
            href: "/settings",
            label: "Settings",
            icon: Settings,
            active: pathname === "/settings",
        },
    ]

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xl px-4">
                    <span>Zidallie Fleet </span>
                </div>
                <nav className="hidden md:flex flex-1 items-center justify-center">
                    <ul className="flex space-x-4">
                        {routes.map((route) => (
                            <li key={route.href}>
                                <Button
                                    asChild
                                    variant={route.active ? "default" : "ghost"}
                                    className={cn("h-9 px-4", route.active && "bg-primary text-white")}
                                >
                                    <Link href={route.href}>
                                        <route.icon className="h-4 w-4" />
                                        {route.label}
                                    </Link>
                                </Button>
                            </li>
                        ))}
                    </ul>
                </nav>
                <form action={logout}>
                    <Button type="submit" variant="ghost" className="rounded-full text-red-500">
                        <LogOutIcon className="h-5 w-5" />
                        <span className=""> Logout </span>
                    </Button>
                </form>
            </div>
        </header>
    )
}
