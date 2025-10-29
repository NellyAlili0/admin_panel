"use client";
import React, { useState, useEffect } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "../SmartCardTable";
import { AddZoneForm } from "./forms";

interface Props {
  email: string;
  password: string;
}

function Zone({ email, password }: Props) {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";

      const res = await fetch(`${baseUrl}/api/smartcards/zone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          tags: ["084b14ea-fdc0-4535-833c-70c2bc43ec52"],
        }),
        cache: "no-store",
      });

      if (!res.ok) {
        console.error("Error fetching zones:", await res.text());
        setZones([]);
        return;
      }

      const data = await res.json();
      console.log("Zones data:", data);

      // Handle different possible response structures
      const zonesData = data?.data?.data || data?.data || [];

      // Ensure it's an array
      setZones(Array.isArray(zonesData) ? zonesData : []);
    } catch (error) {
      console.error("Network error:", error);
      setZones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, [email, password]);

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-6 py-5">
      {/* Header Section */}
      <div className="text-center mb-6">
        <Breadcrumbs
          items={[
            {
              href: "/zones",
              label: "zones",
            },
          ]}
        />
      </div>

      {/* Forms and tables */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Zones</h1>
          </div>
          <AddZoneForm onZoneAdded={fetchZones} />
        </div>
        {loading ? (
          <section className="w-full h-full flex items-center justify-center mt-24">
            <p className="text-gray-500">Loading Zones...</p>
          </section>
        ) : zones.length === 0 ? (
          <section className="w-full h-full flex items-center justify-center mt-24">
            <p className="text-gray-500">No zones found</p>
          </section>
        ) : (
          <GenTable
            title="All Zones"
            cols={["id", "name", "status", "date_created"]}
            data={zones.map((zone) => ({
              ...zone,
              date_created: zone?.created_at
                ? new Date(zone.created_at).toLocaleString()
                : "N/A",
            }))}
            baseLink=""
            uniqueKey=""
          />
        )}
      </div>
    </section>
  );
}
export default Zone;
