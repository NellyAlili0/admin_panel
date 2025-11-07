"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import GenTable from "@/components/tables";
import Link from "next/link";

interface Plan {
  id: number;
  school_name: string;
  description: string | null;
  duration_days: number;
  price: number;
  is_active: boolean;
  is_active_label: string;
}

export function PlansSearch({ data }: { data: Plan[] }) {
  const [query, setQuery] = useState("");

  const filteredData = useMemo(() => {
    const lower = query.toLowerCase();
    return data.filter(
      (p) =>
        p.school_name.toLowerCase().includes(lower) ||
        p.description?.toLowerCase().includes(lower) ||
        p.duration_days.toString().includes(lower) ||
        p.price.toString().includes(lower) ||
        p.is_active_label.toLowerCase().includes(lower)
    );
  }, [query, data]);

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex items-center justify-between w-full mt-4">
        <div className="flex items-center w-full max-w-md bg-white border rounded-2xl shadow-sm px-4 py-3 gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 10.5A6.5 6.5 0 104 10.5a6.5 6.5 0 0013 0z"
            />
          </svg>

          <Input
            type="text"
            placeholder="Search by school, description, price or status..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-none shadow-none focus-visible:ring-0 w-full"
          />
        </div>
        <section>
          <section className="flex  items-center mt-4 gap-2">
            <Link
              href="subscription-plans/subcribe/"
              className="flex bg-gray-800 hover:bg-gray-700 text-white text-base font-medium px-4 py-2.5 outline-none rounded w-max cursor-pointer "
            >
              Create School Subcription
            </Link>
          </section>
        </section>
      </div>

      <GenTable
        title="Subscription Plans"
        cols={[
          "school_name",
          "description",
          "duration_days",
          "price",
          "is_active_label",
          "payment_date",
        ]}
        data={filteredData}
        baseLink="subscription-plans/"
        uniqueKey="id"
      />
    </div>
  );
}
