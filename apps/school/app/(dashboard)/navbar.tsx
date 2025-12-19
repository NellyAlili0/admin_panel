"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  FileBarChart,
  BusFrontIcon,
  Home,
  LogOutIcon,
  SchoolIcon,
  SignalIcon,
  User2Icon,
  Radio,
  BadgePlus,
  Map,
  ChevronDown,
  ChevronRight,
  IdCard,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logout } from "../login/actions";
// import { logout } from "@/app/login/actions"

export function Navbar() {
  const pathname = usePathname();

  const [openSections, setOpenSections] = useState<string[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleSection = (label: string) => {
    setOpenSections((prev) =>
      prev.includes(label)
        ? prev.filter((section) => section !== label)
        : [...prev, label]
    );
  };

  const menuStructure = [
    {
      label: "Transport",
      type: "group",
      icon: BusFrontIcon,
      items: [
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
        {
          href: "/rides-report",
          label: "Rides Report",
          icon: User2Icon,
          active:
            pathname === "/rides-report" ||
            pathname.startsWith("/rides-report/"),
        },
        {
          href: "/payments",
          label: "Payments",
          icon: CreditCard,
          active: pathname === "/payments" || pathname.startsWith("/payments/"),
        },
      ],
    },
    {
      label: "Smartcards",
      type: "group",
      icon: IdCard,
      items: [
        {
          href: "/smartcard-reports",
          label: "History",
          icon: Radio,
          active:
            pathname === "/smartcard-reports" ||
            pathname.startsWith("/smartcard-reports/"),
        },
        {
          href: "/all-smartcards-reports",
          label: "Overview",
          icon: FileBarChart,
          active:
            pathname === "/all-smartcards-reports" ||
            pathname.startsWith("/all-smartcards-reports/"),
        },
        {
          href: "/onboarding",
          label: "Accounts",
          icon: BadgePlus,
          active:
            pathname === "/onboarding" || pathname.startsWith("/onboarding/"),
        },
        {
          href: "/zones",
          label: "Zones",
          icon: Map,
          active: pathname === "/zones" || pathname.startsWith("/zones/"),
        },
      ],
    },
    {
      label: "School",
      type: "link",
      href: "/school",
      icon: SchoolIcon,
      active: pathname === "/school" || pathname.startsWith("/school/"),
    },
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50 bg-background/50 backdrop-blur shadow-sm border"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-screen border-r-2 transition-transform duration-300 ease-in-out",
          "w-64 shrink-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:static"
        )}
      >
        <div className="container w-full flex flex-col gap-2 items-start h-full justify-between md:px-1 lg:px-2 xl:px-4 py-8 overflow-y-auto">
          <nav className="flex flex-col gap-2 items-start justify-start w-full">
            <div className="flex gap-2 font-bold text-xl mb-4 pl-2 md:pl-0">
              <span>School Admin </span>
            </div>
            <ul className="flex flex-col gap-2 w-full items-start">
              {menuStructure.map((item) => {
                // Single link school
                if (item.type === "link") {
                  return (
                    <li key={item.label} className="w-full">
                      <Button
                        asChild
                        variant={item.active ? "default" : "ghost"}
                        className={cn(
                          "h-9 px-4 w-full justify-start font-semibold",
                          item.active && "bg-primary text-white"
                        )}
                      >
                        <Link href={item.href!}>
                          <item.icon className="h-4 w-4 mr-2" />
                          {item.label}
                        </Link>
                      </Button>
                    </li>
                  );
                }

                // Collapsible (Transport, Smartcards)
                const isOpen = openSections.includes(item.label);
                const isGroupActive = item.items?.some((sub) => sub.active);

                return (
                  <li key={item.label} className="w-full">
                    <Button
                      variant="ghost"
                      onClick={() => toggleSection(item.label)}
                      className={cn(
                        "w-full justify-between font-semibold hover:bg-muted mb-1 cursor-pointer",
                        isGroupActive && !isOpen && "text-primary"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </div>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>

                    {isOpen && item.items && (
                      <ul className="flex flex-col gap-1 w-full pl-4 border-l ml-2 transition-all">
                        {item.items.map((route) => (
                          <li key={route.href} className="w-full">
                            <Button
                              asChild
                              variant={route.active ? "default" : "ghost"}
                              className={cn(
                                "h-9 px-4 w-full justify-start text-sm",
                                route.active && "bg-primary text-white"
                              )}
                            >
                              <Link href={route.href}>
                                <route.icon className="h-4 w-4 mr-2" />
                                {route.label}
                              </Link>
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              className="rounded-full text-red-500"
            >
              <LogOutIcon className="h-5 w-5 mr-2" />
              <span className=""> Logout </span>
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
