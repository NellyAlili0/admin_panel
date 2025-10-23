import { Breadcrumbs } from "@/components/breadcrumbs";
import Link from "next/link";
import React from "react";

async function SystemLogs() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-6 py-8">
      {/* Header Section */}
      <div className="text-center mb-14">
        <section className="mb-10">
          <Breadcrumbs
            items={[
              {
                href: "/smartcards-overview",
                label: "Smart Cards Overview",
              },
            ]}
          />
        </section>

        <h1 className="text-4xl font-bold text-gray-800">
          System Setup & Management
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Manage your platform’s users, zones, and routes in one place.
        </p>
        <div className="w-24 h-1 bg-[#efb100] mt-5 mx-auto rounded-full"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6 mb-16 mt-16">
        {[
          { label: "Total Parents", value: "134" },
          { label: "Total Students", value: "268" },
          { label: "Zones Created", value: "14" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition"
          >
            <p className="text-3xl font-bold text-[#efb100]">{stat.value}</p>
            <p className="text-gray-500 text-sm mt-2">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SystemLogs;
