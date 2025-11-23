"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import GenTable from "@/components/PaymentsTable";

interface Payment {
  id: number;
  student_name: string | null;
  school_name: string | null;
  phone_number: string;
  amount_paid: number;
  paid_to_school: number;
  payment_date: string;
}

export function PaymentSearch({ data }: { data: Payment[] }) {
  const [query, setQuery] = useState("");

  const filteredData = useMemo(() => {
    const lower = query.toLowerCase();
    return data.filter(
      (p) =>
        p.student_name?.toLowerCase().includes(lower) ||
        p.school_name?.toLowerCase().includes(lower) ||
        p.phone_number?.toLowerCase().includes(lower) ||
        p.amount_paid.toString().includes(lower) ||
        p.paid_to_school.toString().includes(lower)
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
            placeholder="Search by student, school, phone, or amount..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-none shadow-none focus-visible:ring-0 w-full"
          />
        </div>
      </div>

      <GenTable
        title=""
        cols={[
          "id",
          "student_name",
          "school_name",
          "phone_number",
          "amount_paid",
          "paid_to_school",
          "payment_date",
        ]}
        data={filteredData}
        baseLink="/payments/student-payments/"
        uniqueKey="id"
      />

      {filteredData.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-2">
          No payments match your search.
        </p>
      )}
    </div>
  );
}
