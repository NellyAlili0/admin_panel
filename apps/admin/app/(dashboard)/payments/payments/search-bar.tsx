"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import GenTable from "@/components/PaymentsTable";

interface Payment {
  id: number;
  amount: number;
  transaction_id: string | null;
  created_at: Date;
  student_name: string | null;
  parent_name: string | null;
  school_name: string | null;
  parent_phone: string | null;
}

export function PaymentSearch({ data }: { data: Payment[] }) {
  const [query, setQuery] = useState("");

  const filteredData = useMemo(() => {
    const lower = query.toLowerCase();
    return data.filter(
      (p) =>
        p.parent_name?.toLowerCase().includes(lower) ||
        p.student_name?.toLowerCase().includes(lower) ||
        p.school_name?.toLowerCase().includes(lower) ||
        p.parent_phone?.toLowerCase().includes(lower) ||
        p.transaction_id?.toLowerCase().includes(lower)
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
            placeholder="Search by parent, student, school or phone ..."
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
          "parent_name",
          "parent_phone",
          "school_name",
          "amount",
          // "transaction_id",
          "payment_date",
        ]}
        data={filteredData}
        baseLink="/payments/payments/"
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
