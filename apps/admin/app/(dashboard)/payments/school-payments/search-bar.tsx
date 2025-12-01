"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import GenTable from "../../../../components/PaymentsTable";
import { NoSSR } from "@/components/NoSSR";

interface B2cTransaction {
  id: number;
  transaction_id: string | null;
  transaction_amount: number;
  receiver_party_public_name: string | null;
  created_date: string;
  student: string;
  school: string;
}

export function B2cMpesaSearch({ data }: { data: B2cTransaction[] }) {
  const [query, setQuery] = useState("");

  // Filter data reactively
  const filteredData = useMemo(() => {
    const lower = query.toLowerCase();
    return data.filter(
      (t) =>
        t.transaction_id?.toLowerCase().includes(lower) ||
        t.receiver_party_public_name?.toLowerCase().includes(lower) ||
        t.transaction_amount.toString().includes(lower) ||
        t.student.toLowerCase().includes(lower) ||
        t.school.toLowerCase().includes(lower)
    );
  }, [query, data]);

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* Search bar */}
      <div className="flex items-center justify-between">
        <Input
          type="text"
          placeholder="Search by transaction ID, student, school, receiver name, or amount..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md"
        />
      </div>

      {/* Table */}
      <NoSSR>
        <GenTable
          title="Zidallie to Schools Transactions"
          cols={[
            "id",
            "transaction_id",
            "transaction_amount",
            "student",
            "school",
            "created_date",
          ]}
          data={filteredData}
          baseLink="school-payments/"
          uniqueKey="id"
        />
      </NoSSR>

      {filteredData.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-2">
          No transactions match your search.
        </p>
      )}
    </div>
  );
}
