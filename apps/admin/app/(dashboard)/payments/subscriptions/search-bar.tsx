"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import GenTable from "@/components/tables";

interface Subscription {
  id: number;
  student_name: string | null;
  school_name: string | null;
  parent_name: string | null;
  status_label: string; // derived mapped “PAID | UNPAID”
  total_paid: number;
}

export function SubscriptionSearch({ data }: { data: Subscription[] }) {
  const [query, setQuery] = useState("");

  const filteredData = useMemo(() => {
    const lower = query.toLowerCase();
    return data.filter(
      (s) =>
        s.student_name?.toLowerCase().includes(lower) ||
        s.school_name?.toLowerCase().includes(lower) ||
        s.parent_name?.toLowerCase().includes(lower) ||
        s.status_label?.toLowerCase().includes(lower) ||
        s.total_paid.toString().includes(lower)
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
            placeholder="Search by student, school, parent, status or amount..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-none shadow-none focus-visible:ring-0 w-full"
          />
        </div>
      </div>

      <GenTable
        title="All Subscriptions"
        cols={["student_name", "parent_name", "total_paid", "school_name"]}
        data={filteredData}
        baseLink="subscriptions/"
        uniqueKey="id"
      />

      {filteredData.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-2">
          {/* No subscriptions match your search. */}
        </p>
      )}
    </div>
  );
}
