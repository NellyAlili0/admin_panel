"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HardDriveDownload,
  FileBarChart,
  // BusFrontIcon,
  Home,
  LogOutIcon,
  SchoolIcon,
  SignalIcon,
  User2Icon,
  Radio,
  BadgePlus,
  Map,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logout } from "../login/actions";
// import { logout } from "@/app/login/actions"

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
      href: "/records",
      label: "Parents and Students",
      icon: User2Icon,
      active: pathname === "/records" || pathname.startsWith("/records/"),
    },

    // {
    //   href: "/rides",
    //   label: "Rides",
    //   icon: BusFrontIcon,
    //   active: pathname === "/rides" || pathname.startsWith("/rides/"),
    // },
    {
      href: "/school",
      label: "School",
      icon: SchoolIcon,
      active: pathname === "/school" || pathname.startsWith("/school/"),
    },
    {
      href: "/rides-report",
      label: "Rides Report",
      icon: User2Icon,
      active:
        pathname === "/rides-report" || pathname.startsWith("/rides-report/"),
    },
    {
      href: "/smartcard-reports",
      label: "Smart Card Live",
      icon: Radio,
      active:
        pathname === "/smartcard-reports" ||
        pathname.startsWith("/smartcard-reports/"),
    },
    {
      href: "/all-smartcards-reports",
      label: "All SmartCard Reports",
      icon: FileBarChart,
      active:
        pathname === "/all-smartcards-reports" ||
        pathname.startsWith("/all-smartcards-reports/"),
    },
    {
      href: "/onboarding",
      label: "SmartCards Accounts",
      icon: BadgePlus,
      active: pathname === "/onboarding" || pathname.startsWith("/onboarding/"),
    },
    {
      href: "/zones",
      label: "SmartCards Zones",
      icon: Map,
      active: pathname === "/zones" || pathname.startsWith("/zones/"),
    },
    // {
    //   href: "/smart-cards",
    //   label: "Smart Card Downloads",
    //   icon: HardDriveDownload,
    //   active:
    //     pathname === "/smart-cards" || pathname.startsWith("/smart-cards/"),
    // },

    // {
    //   href: "/smartcards-overview",
    //   label: "Smart Cards Overview",
    //   icon: Radio,
    //   active:
    //     pathname === "/smartcards-overview" ||
    //     pathname.startsWith("/smartcard-overview/"),
    // },
  ];

  return (
    <div className="border-b w-fit bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-screen border-r-2">
      <div className="container w-full flex flex-col gap-2 items-start h-full justify-between  md:px-1 lg:px-2 xl:px-4 py-8">
        <nav className="flex flex-col gap-2 items-start justify-start w-full">
          <div className="flex gap-2 font-bold text-xl">
            <span>School Admin </span>
          </div>
          <ul className="flex flex-col gap-3 w-full items-start flex-wrap">
            {routes.map((route) => (
              <li key={route.href} className="w-full px-1 flex flex-wrap">
                <Button
                  asChild
                  variant={route.active ? "default" : "ghost"}
                  className={cn(
                    "h-9 px-4 w-fit justify-start",
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
