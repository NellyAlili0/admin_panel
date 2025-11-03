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
  const [totalRows, setTotalRows] = useState<number>(0);
  const [perPage, setPerPage] = useState<number>(15);

  const getParentsByTags = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        const res = await fetch(
          `${baseUrl}/api/smartcards/accounts/parentsByTags`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              password,
              tags: ["1b8d5703-b389-4d55-bc53-466ed165f294"],
              page, // Pass the page number to API
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
        setParents(data.data || []);

        // Extract pagination info from meta object
        if (data.meta) {
          setTotalRows(data.meta.total);
          setPerPage(data.meta.per_page);
        }
      } catch (error) {
        console.error("Network error:", error);
        setParents([]);
      } finally {
        setLoading(false);
      }
    },
    [email, password, tag]
  );

  useEffect(() => {
    getParentsByTags(1);
  }, [getParentsByTags]);

  // When a parent is added, refresh the current page
  const handleParentAdded = async () => {
    await getParentsByTags(1); // Refresh to page 1
  };

  // Handle page change from the table
  const handlePageChange = (page: number) => {
    getParentsByTags(page);
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

        {loading && parents.length === 0 ? (
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
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            paginationPerPage={perPage}
            onChangePage={handlePageChange}
            progressPending={loading}
          />
        )}
      </div>
    </section>
  );
}

export default Parents;
