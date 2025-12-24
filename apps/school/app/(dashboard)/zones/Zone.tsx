"use client";
import React, { useState, useEffect } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "../SmartCardTable";
import { AddZoneForm } from "./forms";
import { deleteZone, fetchZones } from "./actions"; // ✅ Import fetchZones
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

// Props are no longer needed as we use Server Actions
function Zone() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadZones = async () => {
    setLoading(true);
    const data = await fetchZones(); // ✅ Clean Server Action call
    setZones(data);
    setLoading(false);
  };

  useEffect(() => {
    loadZones();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this zone?")) return;
    const res = await deleteZone(id);
    if (res.success) {
      toast.success(res.message);
      loadZones(); // Refresh list
    } else {
      toast.error(res.message);
    }
  };

  const tableData = zones.map((zone) => ({
    ...zone,
    date_created: zone?.created_at
      ? new Date(zone.created_at).toLocaleString()
      : "N/A",
    actions: (
      <button
        onClick={() => handleDelete(zone.id)}
        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
        title="Delete Zone"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    ),
  }));

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-6 py-5">
      <div className="text-center mb-6">
        <Breadcrumbs items={[{ href: "/zones", label: "Zones" }]} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <h1 className="text-3xl font-bold tracking-tight">Zones</h1>
          <div className="w-full sm:w-auto [&_button]:w-full sm:[&_button]:w-auto">
            <AddZoneForm onZoneAdded={loadZones} />
          </div>
        </div>
        {loading ? (
          <p className="text-center mt-24 text-gray-500 animate-pulse">
            Loading Zones...
          </p>
        ) : zones.length === 0 ? (
          <p className="text-center mt-24 text-gray-500">No zones found</p>
        ) : (
          <GenTable
            title="All Zones"
            cols={["id", "name", "status", "date_created", "actions"]}
            data={tableData}
            baseLink=""
            uniqueKey="id"
          />
        )}
      </div>
    </section>
  );
}
export default Zone;
