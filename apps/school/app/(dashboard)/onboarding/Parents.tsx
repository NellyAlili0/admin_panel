"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "../SmartCardTable";
import { AddParentForm } from "./forms";
import { deleteParent } from "./actions";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

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
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
        const res = await fetch(
          `${baseUrl}/api/smartcards/accounts/parentsByTags`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              password,
              tags: [tag], // Uses dynamic school tag
              page,
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
    if (tag) {
      getParentsByTags(1);
    }
    // ✅ FIX: Removed 'getParentsByTags' from dependency array to prevent infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag]);

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this parent? All their students will also be removed."
      )
    )
      return;

    const res = await deleteParent(id);
    if (res.success) {
      toast.success(res.message);
      getParentsByTags(1); // Refresh list
    } else {
      toast.error(res.message);
    }
  };

  const handlePageChange = (page: number) => {
    getParentsByTags(page);
  };

  // Map data to include delete button
  const tableData = parents.map((p) => ({
    ...p,
    actions: (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDelete(p.id);
        }}
        className="p-2 text-red-600 hover:bg-red-50 rounded z-10 relative"
        title="Delete Parent"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    ),
  }));

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-6 py-5">
      <div className="text-center mb-6">
        <Breadcrumbs items={[{ href: "/onboarding", label: "Onboarding" }]} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <h1 className="text-3xl font-bold tracking-tight">Parents</h1>
          <div className="w-full sm:w-auto">
            <AddParentForm onParentAdded={() => getParentsByTags(1)} />
          </div>
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
              "actions",
            ]}
            data={tableData}
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
