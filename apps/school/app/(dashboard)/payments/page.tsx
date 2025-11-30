"use client";

import Link from "next/link";
import { School, BadgeDollarSign } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function PaymentsPage() {
  const cards = [
    {
      title: "Students Payments",
      desc: "Detailed view of students payment history",
      href: "/payments/students",
      icon: BadgeDollarSign,
    },
    // {
    //   title: "School Payments",
    //   desc: "payments made to school by zidallie",
    //   href: "/payments/schools",
    //   icon: School,
    // },
  ];

  return (
    <div className="p-8 w-full">
      {/* Header Section */}
      <div className=" mb-14">
        <section className="mb-10">
          <Breadcrumbs
            items={[
              {
                href: "/payments",
                label: "Payments Overview",
              },
            ]}
          />
        </section>

        <h1 className="text-4xl font-bold text-gray-800">Payments Dashboard</h1>
        <p className="text-gray-500 mt-2 text-lg">
          Manage everything related to revenue, billing and schools
          transactions.
        </p>
        <div className="w-24 h-1 bg-[#efb100] mt-5  rounded-full"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 place-items-center items-center w-full">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group border rounded-2xl p-6 transition hover:shadow-lg hover:bg-accent/20 bg-card w-full"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm group-hover:scale-110 transition">
                <c.icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-semibold text-xl">{c.title}</h2>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
