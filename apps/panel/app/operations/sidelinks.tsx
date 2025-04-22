"use client"

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideLinks() {
    const pathname = usePathname();
    const links = [
        {
            name: "Dashboard",
            href: "/operations",
            isActive: pathname === "/operations"
        },
        {
            name: "Users",
            href: "/operations/users",
            isActive: pathname.startsWith("/operations/users")
        },
        {
            name: "Schools",
            href: "/operations/schools",
            isActive: pathname.startsWith("/operations/schools")
        },
        {
            name: "Rides",
            href: "/operations/rides",
            isActive: pathname.startsWith("/operations/rides")
        },
        {
            name: "Fleet",
            href: "/operations/fleet",
            isActive: pathname.startsWith("/operations/fleet")
        },
        {
            name: "Routes",
            href: "/operations/routes",
            isActive: pathname.startsWith("/operations/routes")
        }
    ];
    return (
        <div className="flex flex-col justify-between h-fit">
            <div className="flex flex-col gap-2 text-lg">
                {links.map((link) => (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={cn('p-2 hover:bg-white hover:text-black cursor-pointer', link.isActive ? 'font-bold bg-white text-black' : '')}
                    >
                        {link.name}
                    </Link>
                ))}
            </div>
        </div>
    )
}
