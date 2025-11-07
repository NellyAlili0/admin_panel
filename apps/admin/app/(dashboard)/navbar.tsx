"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BusFrontIcon,
  Car,
  CarFrontIcon,
  CarTaxiFront,
  Home,
  LogOutIcon,
  SchoolIcon,
  SignalIcon,
  User2Icon,
  WalletIcon,
  HardDriveDownload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logout } from "../login/actions";

export function Navbar() {
  const pathname = usePathname();

  const routes = [
    {
      href: "/overview",
      label: "Overview",
      icon: Home,
      active: pathname === "/overview",
    },
    {
      href: "/live",
      label: "Live",
      icon: SignalIcon,
      active: pathname === "/live" || pathname.startsWith("/live/"),
    },
    {
      href: "/drivers",
      label: "Drivers",
      icon: CarTaxiFront,
      active: pathname === "/drivers" || pathname.startsWith("/drivers/"),
    },
    {
      href: "/parents",
      label: "Parents",
      icon: User2Icon,
      active: pathname === "/parents" || pathname.startsWith("/parents/"),
    },
    {
      href: "/rides",
      label: "Rides",
      icon: BusFrontIcon,
      active: pathname === "/rides" || pathname.startsWith("/rides/"),
    },
    {
      href: "/vehicles",
      label: "Vehicles",
      icon: Car,
      active: pathname === "/vehicles" || pathname.startsWith("/vehicles/"),
    },
    {
      href: "/schools",
      label: "Schools",
      icon: SchoolIcon,
      active: pathname === "/schools" || pathname.startsWith("/schools/"),
    },
    {
      href: "/system-logs",
      label: "System Logs",
      icon: HardDriveDownload,
      active:
        pathname === "/system-logs" || pathname.startsWith("/system-logs/"),
    },
    {
      href: "/payments",
      label: "Payments",
      icon: WalletIcon,
      active: pathname === "/payments" || pathname.startsWith("/payments/"),
    },
    // {
    //   href: "/batch-rides",
    //   label: "Batch Rides Creation",
    //   icon: BusFrontIcon,
    //   active:
    //     pathname === "/batch-rides" || pathname.startsWith("/batch-rides/"),
    // },
    {
      href: "/onboarding",
      label: "Onboarding",
      icon: HardDriveDownload,
      active: pathname === "/onboarding" || pathname.startsWith("/onboarding/"),
    },
  ];

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-screen border-r-2">
      <div className="container flex flex-col gap-2 items-start h-full justify-between px-4 py-8">
        <nav className="flex flex-col gap-2 items-start justify-start w-full">
          <div className="flex gap-2 font-bold text-xl">
            <span>Zidallie Admin </span>
          </div>
          <ul className="flex flex-col gap-2 w-full items-start">
            {routes.map((route) => (
              <li key={route.href} className="w-full">
                <Button
                  asChild
                  variant={route.active ? "default" : "ghost"}
                  className={cn(
                    "h-9 px-4 w-full justify-start",
                    route.active && "bg-primary text-white"
                  )}
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
          <Button
            type="submit"
            variant="ghost"
            className="rounded-full text-red-500"
          >
            <LogOutIcon className="h-5 w-5" />
            <span className=""> Logout </span>
          </Button>
        </form>
      </div>
    </div>
  );
}
