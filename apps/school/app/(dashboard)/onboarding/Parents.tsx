"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "../SmartCardTable";
import { AddParentForm } from "./forms";

interface Props {
  email: string;
  password: string;
  tag: string;
}

function Parents({ email, password, tag }: Props) {
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getParentsByTags = useCallback(async () => {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
      const res = await fetch(
        `${baseUrl}/api/smartcards/accounts/parentsByTags`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            tags: ["985f584c-0c10-482f-ac6e-46ce3c376930"],
          }),
          cache: "no-store",
        }
      );

      if (!res.ok) {
        console.error("Error fetching parents:", await res.text());
        setParents([]);
        return;
      }

      const data = await res.json();
      setParents(data.data);
    } catch (error) {
      console.error("Network error:", error);
      setParents([]);
    } finally {
      setLoading(false);
    }
  }, [email, password, tag]);

  useEffect(() => {
    getParentsByTags();
  }, [getParentsByTags]);

  // ✅ When a parent is added, re-fetch just the list
  const handleParentAdded = async () => {
    await getParentsByTags();
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-6 py-5">
      <div className="text-center mb-6">
        <Breadcrumbs items={[{ href: "/onboarding", label: "Onboarding" }]} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Parents</h1>
          <AddParentForm onParentAdded={handleParentAdded} />
        </div>

        {loading ? (
          <section className="w-full h-full flex items-center justify-center mt-24">
            <p className="text-gray-500">Loading Parents...</p>
          </section>
        ) : (
          <GenTable
            title="All Parents"
            cols={[
              "id",
              "first_name",
              "last_name",
              "national_id",
              "phone",
              "status",
            ]}
            data={parents}
            baseLink="onboarding/parents/"
            uniqueKey="id"
          />
        )}
      </div>
    </section>
  );
}

export default Parents;
