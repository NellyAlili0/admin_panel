"use client"

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideLinks() {
    const pathname = usePathname();
    const links = [
        {
            name: "Dashboard",
            href: "/admin",
            isActive: pathname === "/admin"
        },
        {
            name: "Users",
            href: "/admin/users",
            isActive: pathname === "/admin/users"
        },
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
